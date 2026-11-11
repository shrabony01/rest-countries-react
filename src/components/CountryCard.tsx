import { Link } from 'react-router-dom';
import type { Country } from '../types/country';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const raw = country as any;

  // Extract a plain string for the country name
  const commonName: string =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.common || raw.name?.official || 'Unknown Country';

  // Guaranteed string identifier for the URL route
  const identifier: string = String(raw.cca3 || raw.alpha3Code || commonName);

  // Extract the flag image URL
  const flagSrc: string =
    raw.flags?.svg ||
    raw.flags?.png ||
    raw.flag?.svg ||
    raw.flag?.png ||
    (typeof raw.flag === 'string' ? raw.flag : '');

  // Extract the capital string
  const displayCapital = Array.isArray(raw.capital)
    ? raw.capital.join(', ')
    : typeof raw.capital === 'string'
    ? raw.capital
    : 'N/A';

  return (
    <article style={styles.card}>
      <Link to={`/country/${encodeURIComponent(identifier)}`} style={styles.link}>
        <div style={styles.flagContainer}>
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={raw.flags?.alt || `Flag of ${commonName}`}
              style={styles.flagImage}
              loading="lazy"
            />
          ) : (
            <div style={styles.noFlag}>No Flag Available</div>
          )}
        </div>
        <div style={styles.details}>
          <h2 style={styles.title}>{commonName}</h2>
          <p style={styles.infoLine}>
            <strong>Population:</strong>{' '}
            {typeof raw.population === 'number'
              ? raw.population.toLocaleString()
              : 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Region:</strong> {raw.region || 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Capital:</strong> {displayCapital || 'N/A'}
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
    display: 'flex',
    flexDirection: 'column',
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: 'inherit',
    textDecoration: 'none',
  },
  flagContainer: {
    width: '100%',
    height: '160px',
    backgroundColor: '#cbd5e1',
    overflow: 'hidden',
  },
  flagImage: {
    width: '100%',
    height: '160px',
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