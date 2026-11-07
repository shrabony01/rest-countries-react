import type { Country } from '../types/country';

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

    const data: Country[] = await response.json();
    return data;
  } catch (error) {
    console.warn('Live API request failed, loading local fallback data.json:', error);

    const fallbackResponse = await fetch('/data.json');
    if (!fallbackResponse.ok) {
      throw new Error('Local fallback dataset failed to load');
    }

    const fallbackData: Country[] = await fallbackResponse.json();
    return fallbackData;
  }
}