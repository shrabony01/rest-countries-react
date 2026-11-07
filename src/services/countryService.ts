import type{ Country } from '../types/country';

const API_BASE_URL = 'https://api.restcountries.com/countries/v5';
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY || '';

export async function fetchAllCountries(): Promise<Country[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  const requestUrl = `${API_BASE_URL}?pretty=1`;

  try {
    const response = await fetch(requestUrl, { headers });

    if (!response.ok) {
      throw new Error(`API returned HTTP status ${response.status}`);
    }

    const result = await response.json();

    let rawList: any[] = [];

    if (Array.isArray(result)) {
      rawList = result;
    } else if (result && typeof result === 'object') {
      const dataPayload = result.data || result.countries || result.results || result;

      if (Array.isArray(dataPayload)) {
        rawList = dataPayload;
      } else if (typeof dataPayload === 'object' && dataPayload !== null) {
        // If data is a dictionary/hashmap of country objects, extract objects and preserve keys as cca3
        rawList = Object.entries(dataPayload).map(([key, value]: [string, any]) => {
          if (value && typeof value === 'object') {
            return {
              cca3: value.cca3 || value.alpha3Code || key,
              ...value,
            };
          }
          return value;
        });
      }
    }

    if (rawList.length === 0) {
      throw new Error('API returned an empty dataset');
    }

    console.log('✅ Successfully parsed live API countries! Count:', rawList.length);
    return rawList;
  } catch (error) {
    console.warn('API fetch failed, reading fallback data.json:', error);

    const fallbackResponse = await fetch('/data.json');
    if (!fallbackResponse.ok) {
      throw new Error('Local fallback dataset failed to load');
    }

    const fallbackJson = await fallbackResponse.json();
    if (Array.isArray(fallbackJson)) {
      return fallbackJson;
    } else if (fallbackJson && typeof fallbackJson === 'object') {
      const data = fallbackJson.data || fallbackJson;
      return Array.isArray(data) ? data : Object.values(data);
    }
    return [];
  }
}