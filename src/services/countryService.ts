import type { Country } from '../types/country';

const API_BASE_URL = 'https://api.restcountries.com/countries/v5';
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY || '';
const CACHE_STORAGE_KEY = 'rest_countries_full_catalog_v5';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let inFlightPromise: Promise<Country[]> | null = null;

export function fetchAllCountries(): Promise<Country[]> {
  // 1. Session Storage check: 0 API calls on reload once cached
  try {
    const cached = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 200) {
        console.log(`[Cache Hit] Serving ${parsed.length} countries from cache.`);
        return Promise.resolve(parsed);
      }
    }
  } catch {
    sessionStorage.removeItem(CACHE_STORAGE_KEY);
  }

  // Prevent duplicate execution from React StrictMode mounting
  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = loadAllCountriesFromApi().finally(() => {
    inFlightPromise = null;
  });

  return inFlightPromise;
}

async function loadAllCountriesFromApi(): Promise<Country[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  let allObjects: any[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  console.log('[Live API] Fetching complete dataset using limit=100 pagination...');

  while (hasMore) {
    const url = `${API_BASE_URL}?limit=${limit}&offset=${offset}&pretty=1`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`API fetch failed with status ${res.status}`);
    }

    const data = await res.json();
    const batch = data?.data?.objects || [];
    allObjects = allObjects.concat(batch);

    // Check data.meta.more as instructed
    hasMore = Boolean(data?.data?.meta?.more);
    offset += limit;

    if (hasMore) {
      await wait(300); // Respectful pause between the 3 requests
    }
  }

  // Deduplicate entries by country identifier
  const seen = new Set<string>();
  const uniqueItems = allObjects.filter((item: any) => {
    const code = item.codes?.alpha_3 || item.codes?.cca3 || item.names?.common || '';
    const id = String(code).toLowerCase().trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const normalized = normalizeApiCountries(uniqueItems);

  // Cache in session storage
  try {
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(normalized));
  } catch (e) {
    console.warn('Storage write failed:', e);
  }

  console.log(`✅ [Live API Success] Loaded ${normalized.length} countries from API.`);
  return normalized;
}

function normalizeApiCountries(rawList: any[]): Country[] {
  return rawList.map((item: any) => {
    // 1. Resolve Country Name
    const commonName =
      item.names?.common ||
      item.names?.name ||
      item.names?.official ||
      (typeof item.name === 'string' ? item.name : item.name?.common) ||
      'Unknown Country';

    let nativeName = commonName;
    if (item.names?.native && typeof item.names.native === 'object') {
      const first = Object.values(item.names.native)[0] as any;
      nativeName = first?.common || first?.official || String(first) || commonName;
    }

    // 2. Resolve Country Codes
    const codes = item.codes || {};
    const alpha3 = (
      codes.alpha_3 ||
      codes.cca3 ||
      codes.iso_3 ||
      item.cca3 ||
      commonName
    ).trim().toUpperCase();

    const alpha2 = (
      codes.alpha_2 ||
      codes.cca2 ||
      codes.iso_2 ||
      item.cca2 ||
      ''
    ).trim().toLowerCase();

    // 3. Fallback Chain for Flags:
    // Step A: try url_svg
    // Step B: try url_png
    // Step C: try official REST Countries Flag CDN via codes.alpha_2
    // Step D: empty string (falls back to the accessible placeholder box)
    const flagObj = item.flag || {};
    let flagSvg = flagObj.url_svg || flagObj.svg || '';
    let flagPng = flagObj.url_png || flagObj.png || '';

    if (!flagSvg && !flagPng && alpha2 && alpha2.length === 2) {
      flagSvg = `https://flags.restcountries.com/v5/svg/${alpha2}.svg`;
      flagPng = `https://flags.restcountries.com/v5/w320/${alpha2}.png`;
    }

    // Step E: Use flag.description for accessibility
    const flagAlt = flagObj.description || `Flag of ${commonName}`;

    // 4. Resolve Capitals
    let capitalList: string[] = [];
    const caps = item.capitals || item.capital;
    if (Array.isArray(caps)) {
      capitalList = caps
        .map((c: any) => (typeof c === 'string' ? c : c?.name || c?.common || ''))
        .filter(Boolean);
    } else if (typeof caps === 'string' && caps.trim() !== '') {
      capitalList = [caps];
    }

    // 5. Currencies
    let formattedCurrencies = 'N/A';
    if (Array.isArray(item.currencies)) {
      formattedCurrencies = item.currencies
        .map((c: any) => (typeof c === 'string' ? c : c?.name || c?.code || ''))
        .filter(Boolean)
        .join(', ');
    } else if (item.currencies && typeof item.currencies === 'object') {
      formattedCurrencies = Object.values(item.currencies)
        .map((c: any) => (typeof c === 'string' ? c : c?.name || c?.code || c?.symbol || ''))
        .filter(Boolean)
        .join(', ');
    }

    // 6. Languages
    let formattedLanguages = 'N/A';
    if (Array.isArray(item.languages)) {
      formattedLanguages = item.languages
        .map((l: any) => (typeof l === 'string' ? l : l?.name || l?.common || ''))
        .filter(Boolean)
        .join(', ');
    } else if (item.languages && typeof item.languages === 'object') {
      formattedLanguages = Object.values(item.languages)
        .map((l: any) => (typeof l === 'string' ? l : l?.name || ''))
        .filter(Boolean)
        .join(', ');
    }

    // 7. Borders
    let borders: string[] = [];
    if (Array.isArray(item.borders)) {
      borders = item.borders
        .map((b: any) => (typeof b === 'object' && b !== null ? b.cca3 || b.alpha_3 || b.code || b.name : String(b)))
        .filter(Boolean);
    }

    // 8. Top Level Domains
    let topLevelDomain: string[] = [];
    const rawTlds = item.tlds || item.topLevelDomain || item.tld;
    if (Array.isArray(rawTlds)) {
      topLevelDomain = rawTlds.map(String).filter(Boolean);
    } else if (typeof rawTlds === 'string') {
      topLevelDomain = [rawTlds];
    }

    return {
      ...item,
      name: commonName,
      commonName,
      nativeName,
      cca3: alpha3,
      alpha3Code: alpha3,
      cca2: alpha2,
      population: typeof item.population === 'number' ? item.population : 0,
      region: item.region || item.continent || 'N/A',
      subregion: item.subregion || 'N/A',
      capital: capitalList.length > 0 ? capitalList : ['N/A'],
      topLevelDomain: topLevelDomain.length > 0 ? topLevelDomain : ['N/A'],
      currencies: formattedCurrencies || 'N/A',
      languages: formattedLanguages || 'N/A',
      borders,
      flags: {
        svg: flagSvg,
        png: flagPng || flagSvg,
        alt: flagAlt,
      },
    } as Country;
  });
}