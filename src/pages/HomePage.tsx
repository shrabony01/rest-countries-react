import { useState, useMemo } from 'react';
import { useCountries } from '../hooks/useCountries';
import { SearchBar } from '../components/SearchBar';
import { FilterDropdown } from '../components/FilterDropdown';
import { CountryCard } from '../components/CountryCard';

export function HomePage() {
  // 1. Destructure using 'isLoading' or fallback to loading
  const countryHook = useCountries() as any;
  const countries = countryHook.countries || [];
  const loading = countryHook.isLoading ?? countryHook.loading ?? false;
  const error = countryHook.error || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');

  // 2. Filter countries in real-time
  const filteredCountries = useMemo(() => {
    return countries.filter((country: any) => {
      const countryName = (
        typeof country.name === 'string'
          ? country.name
          : country.name?.common || country.name?.official || ''
      ).toLowerCase();

      const matchesSearch = countryName.includes(searchQuery.trim().toLowerCase());
      const matchesRegion = selectedRegion ? country.region === selectedRegion : true;
      return matchesSearch && matchesRegion;
    });
  }, [countries, searchQuery, selectedRegion]);

  // Props helper for SearchBar
  const searchProps: any = {
    searchQuery,
    setSearchQuery,
    searchTerm: searchQuery,
    setSearchTerm: setSearchQuery,
    onSearchChange: setSearchQuery,
    value: searchQuery,
    onChange: (e: any) => setSearchQuery(e?.target ? e.target.value : e),
  };

  // Props helper for FilterDropdown
  const filterProps: any = {
    selectedRegion,
    setSelectedRegion,
    region: selectedRegion,
    setRegion: setSelectedRegion,
    onRegionChange: setSelectedRegion,
    onSelectRegion: setSelectedRegion,
  };

  return (
    <main style={styles.mainContainer}>
      <section style={styles.controlsSection} aria-label="Search and Filter Controls">
        <SearchBar {...searchProps} />
        <FilterDropdown {...filterProps} />
      </section>

      {loading && (
        <div style={styles.statusMessage} role="status">
          Loading countries...
        </div>
      )}

      {error && !loading && (
        <div style={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {!loading && !error && filteredCountries.length === 0 && (
        <div style={styles.statusMessage}>
          No countries match your search criteria.
        </div>
      )}

      {!loading && !error && filteredCountries.length > 0 && (
        <section style={styles.gridSection} aria-label="Countries List">
          <div style={styles.countryGrid}>
            {filteredCountries.map((country: any, index: number) => (
              <CountryCard
                key={`${country.cca3 || country.alpha3Code || country.name || 'country'}-${index}`}
                country={country}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
    minHeight: 'calc(100vh - 80px)',
  },
  controlsSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
    marginBottom: '3rem',
  },
  gridSection: {
    width: '100%',
  },
  countryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '3rem 2.5rem',
  },
  statusMessage: {
    textAlign: 'center',
    padding: '4rem 1rem',
    fontSize: '1.2rem',
    color: 'var(--text-color)',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '3rem 1rem',
    fontSize: '1.1rem',
    color: '#ef4444',
  },
};