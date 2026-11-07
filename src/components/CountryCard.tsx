import { Link } from 'react-router-dom';
import type{ Country } from '../types/country';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const code = country.cca3 || country.cca2 || country.ccn3 || country.name?.common || 'unknown';

  // Handle capital safely whether it is an array, string, or undefined
  const displayCapital = Array.isArray(country.capital)
    ? country.capital.join(', ')
    : typeof country.capital === 'string'
    ? country.capital
    : 'N/A';

  const flagSrc = country.flags?.svg || country.flags?.png || '';
  const countryName = country.name?.common || (country as any).name || 'Unknown Country';

  return (
    <article style={styles.card}>
      <Link to={`/country/${encodeURIComponent(code)}`} style={styles.link}>
        <div style={styles.flagContainer}>
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={country.flags?.alt || `Flag of ${countryName}`}
              style={styles.flagImage}
              loading="lazy"
            />
          ) : (
            <div style={styles.noFlag}>No Flag Available</div>
          )}
        </div>
        <div style={styles.details}>
          <h2 style={styles.title}>{countryName}</h2>
          <p style={styles.infoLine}>
            <strong>Population:</strong> {country.population?.toLocaleString() ?? 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Region:</strong> {country.region || 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Capital:</strong> {displayCapital}
          </p>
        </div>
      </Link>
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: 'var(--element-color)',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'var(--box-shadow)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: 'inherit',
  },
  flagContainer: {
    width: '100%',
    height: '160px',
    backgroundColor: '#e2e8f0',
    overflow: 'hidden',
  },
  flagImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  noFlag: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    color: 'var(--input-color)',
  },
  details: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 800,
    marginBottom: '0.6rem',
    color: 'var(--text-color)',
  },
  infoLine: {
    fontSize: '0.875rem',
    color: 'var(--text-color)',
    lineHeight: 1.4,
  },
};