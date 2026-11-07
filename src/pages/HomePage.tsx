import { useState, useMemo } from 'react';
import type{ Country, Region } from '../types/country';
import { SearchBar } from '../components/SearchBar';
import { FilterDropdown } from '../components/FilterDropdown';
import { CountryCard } from '../components/CountryCard';

interface HomePageProps {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
}

export function HomePage({ countries, isLoading, error }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<Region>('All');

  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
      const matchesSearch = country.name.common
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());

      const matchesRegion =
        selectedRegion === 'All' ||
        country.region.toLowerCase() === selectedRegion.toLowerCase();

      return matchesSearch && matchesRegion;
    });
  }, [countries, searchQuery, selectedRegion]);

  return (
    <main style={styles.container}>
      <section style={styles.controlsRow} aria-label="Country search and filtering controls">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterDropdown selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} />
      </section>

      {isLoading && (
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading countries from API...</p>
        </div>
      )}

      {error && !isLoading && (
        <div style={styles.statusBox}>
          <p style={{ ...styles.statusText, color: '#e53e3e' }}>{error}</p>
        </div>
      )}

      {!isLoading && !error && filteredCountries.length === 0 && (
        <div style={styles.statusBox}>
          <p style={styles.statusText}>No countries match your search criteria.</p>
        </div>
      )}

      {!isLoading && !error && filteredCountries.length > 0 && (
        <section style={styles.grid} aria-label="Country listings">
          {filteredCountries.map((country) => (
            <CountryCard
              key={country.cca3 || country.ccn3 || country.name.common}
              country={country}
            />
          ))}
        </section>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2.5rem 1rem 4rem 1rem',
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
    marginBottom: '2.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '3rem',
  },
  statusBox: {
    textAlign: 'center',
    padding: '4rem 1rem',
  },
  statusText: {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: 'var(--text-color)',
  },
};