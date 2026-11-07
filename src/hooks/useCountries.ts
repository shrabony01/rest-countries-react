import { useState, useEffect } from 'react';
import type{ Country } from '../types/country';
import { fetchAllCountries } from '../services/countryService';

interface UseCountriesReturn {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

export function useCountries(): UseCountriesReturn {
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchAllCountries();
        if (isMounted) {
          setCountries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch country data');
          setCountries([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { countries, isLoading, error };
}