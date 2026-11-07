import type { Country } from '../types/country';

const OPEN_API_URL = 'https://restcountries.com/v3.1/all';
const V5_API_URL = 'https://api.restcountries.com/countries/v5?pretty=1';
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY || '';

export async function fetchAllCountries(): Promise<Country[]> {
  // Strategy 1: Attempt the open standard v3.1 API (returns all ~250 countries with complete flags)
  try {
    const res = await fetch(OPEN_API_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 100) {
        console.log(`✅ Loaded ${data.length} countries from open live API`);
        return normalizeCountryList(data);
      }
    }
  } catch (e) {
    console.warn('Standard open API unreachable, trying authenticated v5...');
  }

  // Strategy 2: Attempt the v5 API endpoint
  if (API_KEY) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      };
      const res = await fetch(V5_API_URL, { headers });
      if (res.ok) {
        const json = await res.json();
        const rawList = json?.data?.objects || (Array.isArray(json?.data) ? json.data : null);
        if (Array.isArray(rawList) && rawList.length > 100) {
          console.log(`✅ Loaded ${rawList.length} countries from v5 API`);
          return normalizeCountryList(rawList);
        }
      }
    } catch (e) {
      console.warn('v5 API failed or paginated, using full data.json fallback...');
    }
  }

  // Strategy 3: Reliable local fallback containing all 250 countries with guaranteed flags
  console.log('🔄 Loading complete 250-country dataset from local data.json');
  const fallbackRes = await fetch('/data.json');
  if (!fallbackRes.ok) {
    throw new Error('Failed to load country data');
  }
  const fallbackData = await fallbackRes.json();
  const list = Array.isArray(fallbackData) ? fallbackData : fallbackData.data || [];
  return normalizeCountryList(list);
}

function normalizeCountryList(rawList: any[]): Country[] {
  return rawList.map((item: any) => {
    // 1. Name
    let commonName = 'Unknown Country';
    let nativeName = '';

    if (item.names && typeof item.names === 'object') {
      commonName = item.names.common || item.names.name || item.names.official || Object.values(item.names)[0] || commonName;
      nativeName = item.names.native || item.names.nativeName || commonName;
    } else if (typeof item.name === 'string') {
      commonName = item.name;
      nativeName = item.nativeName || item.name;
    } else if (item.name?.common) {
      commonName = item.name.common;
      nativeName = item.name.nativeName ? (Object.values(item.name.nativeName)[0] as any)?.common : commonName;
    }

    // 2. Code
    const code =
      item.cca3 ||
      item.alpha3Code ||
      item.cca2 ||
      item.alpha2Code ||
      item.codes?.cca3 ||
      item.codes?.alpha3 ||
      commonName;

    const twoLetter = (
      item.cca2 ||
      item.alpha2Code ||
      item.codes?.cca2 ||
      code.slice(0, 2)
    ).toLowerCase();

    // 3. Flags
    let flagSvg = '';
    let flagPng = '';
    const flagObj = item.flags || item.flag;

    if (flagObj && typeof flagObj === 'object') {
      flagSvg = flagObj.svg || flagObj.png || flagObj.url || '';
      flagPng = flagObj.png || flagObj.svg || '';
    } else if (typeof flagObj === 'string' && flagObj.startsWith('http')) {
      flagSvg = flagObj;
      flagPng = flagObj;
    }

    // Fallback to high-res FlagCDN using the 2-letter country code
    if (!flagSvg && twoLetter && twoLetter.length === 2) {
      flagSvg = `https://flagcdn.com/${twoLetter}.svg`;
      flagPng = `https://flagcdn.com/w320/${twoLetter}.png`;
    }

    // 4. Capitals
    let capitalList: string[] = [];
    const rawCapitals = item.capitals || item.capital;
    if (Array.isArray(rawCapitals)) {
      capitalList = rawCapitals
        .map((c: any) => (typeof c === 'string' ? c : c?.name || c?.common || ''))
        .filter(Boolean);
    } else if (typeof rawCapitals === 'string' && rawCapitals.trim() !== '') {
      capitalList = [rawCapitals];
    }

    // 5. Region, Population, Currencies, Languages, Borders
    const region = item.region || item.continent || 'N/A';
    const subregion = item.subregion || item.sub_region || 'N/A';
    const population = typeof item.population === 'number' ? item.population : 0;
    const currencies = item.currencies || item.currency || null;
    const languages = item.languages || item.language || null;
    const borders = item.borders || item.border_countries || [];

    return {
      ...item,
      cca3: code,
      alpha3Code: code,
      name: commonName,
      commonName,
      nativeName,
      region,
      subregion,
      population,
      capital: capitalList,
      currencies,
      languages,
      borders,
      flags: {
        svg: flagSvg,
        png: flagPng || flagSvg,
        alt: `Flag of ${commonName}`,
      },
    } as Country;
  });
}