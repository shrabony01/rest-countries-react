import { useParams, Link, useNavigate } from 'react-router-dom';
import type{ Country } from '../types/country';

interface CountryDetailPageProps {
  countries: Country[];
  isLoading: boolean;
}

export function CountryDetailPage({ countries, isLoading }: CountryDetailPageProps) {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <main style={styles.container}>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Loading country details...</p>
        </div>
      </main>
    );
  }

  const searchTarget = decodeURIComponent(countryCode || '').trim().toLowerCase();

  const currentCountry: any = (countries as any[]).find((c) => {
    const rawCommon = typeof c.name === 'string' ? c.name : c.name?.common;
    const rawOfficial = typeof c.name === 'object' ? c.name?.official : '';

    return (
      c.cca3?.toLowerCase() === searchTarget ||
      c.alpha3Code?.toLowerCase() === searchTarget ||
      c.cca2?.toLowerCase() === searchTarget ||
      c.alpha2Code?.toLowerCase() === searchTarget ||
      rawCommon?.toLowerCase() === searchTarget ||
      rawOfficial?.toLowerCase() === searchTarget
    );
  });

  if (!currentCountry) {
    return (
      <main style={styles.container}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back
        </button>
        <div style={styles.statusBox}>
          <p style={styles.statusText}>Country not found.</p>
        </div>
      </main>
    );
  }

  const displayName =
    typeof currentCountry.name === 'string'
      ? currentCountry.name
      : currentCountry.name?.common || currentCountry.name?.official || 'N/A';

  // Native Name
  let nativeName = displayName;
  if (currentCountry.nativeName) {
    nativeName = currentCountry.nativeName;
  } else if (typeof currentCountry.name === 'object' && currentCountry.name?.nativeName) {
    const vals = Object.values(currentCountry.name.nativeName) as any[];
    if (vals.length > 0 && vals[0]?.common) {
      nativeName = vals[0].common;
    }
  }

  // Capital
  const capitalDisplay = Array.isArray(currentCountry.capital)
    ? currentCountry.capital.join(', ')
    : typeof currentCountry.capital === 'string'
    ? currentCountry.capital
    : 'N/A';

  // Currencies
  let currencies = 'N/A';
  if (currentCountry.currencies) {
    if (Array.isArray(currentCountry.currencies)) {
      currencies = currentCountry.currencies
        .map((curr: any) => `${curr.name || ''} (${curr.symbol || ''})`)
        .join(', ');
    } else if (typeof currentCountry.currencies === 'object') {
      currencies = Object.values(currentCountry.currencies)
        .map((curr: any) => `${curr.name || ''} (${curr.symbol || ''})`)
        .join(', ');
    }
  }

  // Languages
  let languages = 'N/A';
  if (currentCountry.languages) {
    if (Array.isArray(currentCountry.languages)) {
      languages = currentCountry.languages
        .map((l: any) => (typeof l === 'string' ? l : l.name))
        .join(', ');
    } else if (typeof currentCountry.languages === 'object') {
      languages = Object.values(currentCountry.languages).join(', ');
    }
  }

  // Border resolution
  const borderCountries = Array.isArray(currentCountry.borders)
    ? currentCountry.borders.map((borderCode: string) => {
        const found: any = (countries as any[]).find(
          (c) =>
            c.cca3?.toUpperCase() === borderCode.toUpperCase() ||
            c.alpha3Code?.toUpperCase() === borderCode.toUpperCase()
        );
        const name = found
          ? typeof found.name === 'string'
            ? found.name
            : found.name?.common
          : borderCode;
        return { code: borderCode, name: name || borderCode };
      })
    : [];

  const flagSrc =
    currentCountry.flags?.svg ||
    currentCountry.flags?.png ||
    currentCountry.flag ||
    '';

  return (
    <main style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <section style={styles.detailGrid} aria-label={`Details for ${displayName}`}>
        <div style={styles.flagWrapper}>
          <img
            src={flagSrc}
            alt={currentCountry.flags?.alt || `Flag of ${displayName}`}
            style={styles.flagImg}
          />
        </div>

        <div style={styles.infoWrapper}>
          <h1 style={styles.title}>{displayName}</h1>

          <div style={styles.columns}>
            <div style={styles.column}>
              <p style={styles.metaItem}>
                <strong>Native Name:</strong> {nativeName}
              </p>
              <p style={styles.metaItem}>
                <strong>Population:</strong> {currentCountry.population?.toLocaleString() ?? 'N/A'}
              </p>
              <p style={styles.metaItem}>
                <strong>Region:</strong> {currentCountry.region || 'N/A'}
              </p>
              <p style={styles.metaItem}>
                <strong>Sub Region:</strong> {currentCountry.subregion || 'N/A'}
              </p>
              <p style={styles.metaItem}>
                <strong>Capital:</strong> {capitalDisplay}
              </p>
            </div>

            <div style={styles.column}>
              <p style={styles.metaItem}>
                <strong>Top Level Domain:</strong>{' '}
                {Array.isArray(currentCountry.topLevelDomain)
                  ? currentCountry.topLevelDomain.join(', ')
                  : currentCountry.tld?.join(', ') || 'N/A'}
              </p>
              <p style={styles.metaItem}>
                <strong>Currencies:</strong> {currencies}
              </p>
              <p style={styles.metaItem}>
                <strong>Languages:</strong> {languages}
              </p>
            </div>
          </div>

          <div style={styles.borderSection}>
            <strong style={styles.borderLabel}>Border Countries:</strong>
            <div style={styles.borderBadges}>
              {borderCountries.length > 0 ? (
                borderCountries.map((b) => (
                  <Link key={b.code} to={`/country/${encodeURIComponent(b.code)}`} style={styles.borderBadge}>
                    {b.name}
                  </Link>
                ))
              ) : (
                <span style={{ fontSize: '0.875rem', color: 'var(--input-color)' }}>None</span>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '2.5rem 1rem 4rem 1rem',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: 'var(--element-color)',
    color: 'var(--text-color)',
    border: 'none',
    boxShadow: 'var(--box-shadow)',
    borderRadius: '6px',
    padding: '0.6rem 2rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '3rem',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '4rem',
    alignItems: 'center',
  },
  flagWrapper: {
    width: '100%',
    maxHeight: '400px',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: 'var(--box-shadow)',
  },
  flagImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  infoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--text-color)',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '2rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metaItem: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    color: 'var(--text-color)',
  },
  borderSection: {
    marginTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.75rem',
  },
  borderLabel: {
    fontSize: '0.9rem',
    color: 'var(--text-color)',
    marginRight: '0.5rem',
  },
  borderBadges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  borderBadge: {
    backgroundColor: 'var(--element-color)',
    color: 'var(--text-color)',
    padding: '0.4rem 1.2rem',
    borderRadius: '4px',
    boxShadow: 'var(--box-shadow)',
    fontSize: '0.8rem',
    fontWeight: 600,
    display: 'inline-block',
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