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

  // Request all fields with high limit if paginated
  const requestUrl = `${API_BASE_URL}?pretty=1&limit=300`;

  try {
    const response = await fetch(requestUrl, { headers });

    if (!response.ok) {
      throw new Error(`API returned HTTP status ${response.status}`);
    }

    const result = await response.json();
    console.log('API Full Result Object:', result);

    let rawList: any[] = [];

    if (Array.isArray(result)) {
      rawList = result;
    } else if (result && typeof result === 'object') {
      const candidates = [
        result.data,
        result.countries,
        result.results,
        result.items,
        result
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.length > 2) {
          rawList = candidate;
          break;
        } else if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
          const values = Object.values(candidate);
          if (values.length > 2) {
            rawList = values;
            break;
          }
        }
      }

      // If still empty or only 2 metadata objects, check result.data directly
      if (rawList.length === 0 && result.data) {
        rawList = Array.isArray(result.data) ? result.data : Object.values(result.data);
      }
    }

    console.log('Parsed Country List Sample [0]:', rawList[0]);
    console.log('Total Countries Parsed:', rawList.length);

    if (rawList.length === 0) {
      throw new Error('API returned an empty list');
    }

    return rawList;
  } catch (error) {
    console.warn('API fetch failed or returned partial structure, reading fallback data.json:', error);

    const fallbackResponse = await fetch('/data.json');
    if (!fallbackResponse.ok) {
      throw new Error('Local fallback dataset failed to load');
    }

    const fallbackJson = await fallbackResponse.json();
    return Array.isArray(fallbackJson) ? fallbackJson : fallbackJson.data || [];
  }
}