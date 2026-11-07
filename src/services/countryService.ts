import type{ Country } from '../types/country';

const API_BASE_URL = 'https://api.restcountries.com/countries/v5';
const API_KEY = import.meta.env.VITE_REST_COUNTRIES_API_KEY;

export async function fetchAllCountries(): Promise<Country[]> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}?pretty=1`, { headers });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const result = await response.json();

    // REST Countries v5 can return an array or { data: [...] }
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else {
      throw new Error('API response was not an array');
    }
  } catch (error) {
    console.warn('API fetch failed or returned invalid shape. Falling back to local data.json:', error);

    const fallbackResponse = await fetch('/data.json');
    if (!fallbackResponse.ok) {
      throw new Error('Local fallback dataset failed to load');
    }

    const fallbackData = await fallbackResponse.json();
    if (Array.isArray(fallbackData)) {
      return fallbackData;
    } else if (fallbackData && Array.isArray(fallbackData.data)) {
      return fallbackData.data;
    }
    return [];
  }
}