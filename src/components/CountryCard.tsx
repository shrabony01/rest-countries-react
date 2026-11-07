import { Link } from 'react-router-dom';
import type{ Country } from '../types/country';

interface CountryCardProps {
  country: Country;
}

export function CountryCard({ country }: CountryCardProps) {
  const raw = country as any;

  // Resolve country name across v5 (name.common or name) and fallback
  const rawName =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.common || raw.name?.official || 'Unknown Country';

  // Resolve identifier for URL
  const countryIdentifier =
    raw.cca3 ||
    raw.alpha3Code ||
    raw.cca2 ||
    raw.alpha2Code ||
    rawName;

  // Resolve flag URL safely
  const flagSrc =
    (typeof raw.flags?.svg === 'string' && raw.flags.svg.trim() !== '' ? raw.flags.svg : null) ||
    (typeof raw.flags?.png === 'string' && raw.flags.png.trim() !== '' ? raw.flags.png : null) ||
    (typeof raw.flag === 'string' && raw.flag.trim() !== '' && !raw.flag.startsWith('http') ? null : raw.flag) ||
    null;

  const displayCapital = Array.isArray(raw.capital)
    ? raw.capital.join(', ')
    : typeof raw.capital === 'string'
    ? raw.capital
    : 'N/A';

  return (
    <article style={styles.card}>
      <Link to={`/country/${encodeURIComponent(countryIdentifier)}`} style={styles.link}>
        <div style={styles.flagContainer}>
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={raw.flags?.alt || `Flag of ${rawName}`}
              style={styles.flagImage}
              loading="lazy"
            />
          ) : (
            <div style={styles.noFlag}>No Flag</div>
          )}
        </div>
        <div style={styles.details}>
          <h2 style={styles.title}>{rawName}</h2>
          <p style={styles.infoLine}>
            <strong>Population:</strong> {raw.population?.toLocaleString() ?? 'N/A'}
          </p>
          <p style={styles.infoLine}>
            <strong>Region:</strong> {raw.region || 'N/A'}
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
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease',
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