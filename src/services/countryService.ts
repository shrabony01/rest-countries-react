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
    console.log('API Raw Response Structure:', result);

    // Extract the country array regardless of wrapper property
    let countriesArray: any[] = [];

    if (Array.isArray(result)) {
      countriesArray = result;
    } else if (result && typeof result === 'object') {
      // Check common API envelope keys: data, countries, results, items
      if (Array.isArray(result.data)) {
        countriesArray = result.data;
      } else if (Array.isArray(result.countries)) {
        countriesArray = result.countries;
      } else if (Array.isArray(result.results)) {
        countriesArray = result.results;
      } else {
        // Find whichever key contains an array
        const arrayKey = Object.keys(result).find((k) => Array.isArray(result[k]));
        if (arrayKey) {
          countriesArray = result[arrayKey];
        } else {
          console.error('Available keys in API response:', Object.keys(result));
          throw new Error('API response did not contain an array under any key');
        }
      }
    }

    console.log('Successfully extracted live API countries! Count:', countriesArray.length);
    return countriesArray;
  } catch (error) {
    console.warn('API fetch failed, falling back to data.json:', error);

    const fallbackResponse = await fetch('/data.json');
    if (!fallbackResponse.ok) {
      throw new Error('Local fallback dataset failed to load');
    }

    const fallbackJson = await fallbackResponse.json();
    return Array.isArray(fallbackJson) ? fallbackJson : fallbackJson.data || [];
  }
}