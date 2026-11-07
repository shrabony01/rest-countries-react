import { Link } from 'react-router-dom';
import type{ Country } from '../types/country';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const code = country.cca3 || country.cca2 || country.ccn3 || country.name.common;

  return (
    <article style={styles.card}>
      <Link to={`/country/${encodeURIComponent(code)}`} style={styles.link}>
        <div style={styles.flagContainer}>
          <img
            src={country.flags.svg || country.flags.png}
            alt={country.flags.alt || `Flag of ${country.name.common}`}
            style={styles.flagImage}
            loading="lazy"
          />
        </div>
        <div style={styles.details}>
          <h2 style={styles.title}>{country.name.common}</h2>
          <p style={styles.infoLine}>
            <strong>Population:</strong> {country.population?.toLocaleString() ?? 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Region:</strong> {country.region || 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Capital:</strong> {country.capital?.join(', ') || 'N/A'}
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