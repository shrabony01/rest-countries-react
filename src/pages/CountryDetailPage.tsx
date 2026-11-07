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
      c.code?.toLowerCase() === searchTarget ||
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

  // 1. Resolve Display Name
  const displayName =
    typeof currentCountry.name === 'string'
      ? currentCountry.name
      : currentCountry.name?.common || currentCountry.name?.official || 'N/A';

  // 2. Resolve Native Name
  let nativeName = displayName;
  if (typeof currentCountry.nativeName === 'string') {
    nativeName = currentCountry.nativeName;
  } else if (currentCountry.name?.nativeName && typeof currentCountry.name.nativeName === 'object') {
    const vals = Object.values(currentCountry.name.nativeName) as any[];
    if (vals.length > 0 && typeof vals[0] === 'object' && vals[0]?.common) {
      nativeName = vals[0].common;
    } else if (vals.length > 0 && typeof vals[0] === 'string') {
      nativeName = vals[0];
    }
  } else if (currentCountry.names?.native && typeof currentCountry.names.native === 'string') {
    nativeName = currentCountry.names.native;
  }

  // 3. Resolve Capital
  const rawCap = currentCountry.capitals || currentCountry.capital;
  let capitalDisplay = 'N/A';
  if (Array.isArray(rawCap)) {
    capitalDisplay = rawCap
      .map((item) => (typeof item === 'string' ? item : item?.name || item?.common || ''))
      .filter(Boolean)
      .join(', ');
  } else if (typeof rawCap === 'string' && rawCap.trim() !== '') {
    capitalDisplay = rawCap;
  }

  // 4. Resolve Currencies safely
  let currencies = 'N/A';
  const currData = currentCountry.currencies || currentCountry.currency;
  if (Array.isArray(currData)) {
    currencies = currData
      .map((curr: any) =>
        typeof curr === 'string'
          ? curr
          : `${curr?.name || ''} ${curr?.symbol ? `(${curr.symbol})` : ''}`.trim()
      )
      .filter(Boolean)
      .join(', ');
  } else if (currData && typeof currData === 'object') {
    currencies = Object.values(currData)
      .map((curr: any) =>
        typeof curr === 'string'
          ? curr
          : `${curr?.name || ''} ${curr?.symbol ? `(${curr.symbol})` : ''}`.trim()
      )
      .filter(Boolean)
      .join(', ');
  }

  // 5. Resolve Languages safely (handles { abk: "Abkhazian", rus: "Russian" })
  let languages = 'N/A';
  const langData = currentCountry.languages || currentCountry.language;
  if (Array.isArray(langData)) {
    languages = langData
      .map((l: any) => (typeof l === 'string' ? l : l?.name || l?.common || ''))
      .filter(Boolean)
      .join(', ');
  } else if (langData && typeof langData === 'object') {
    languages = Object.values(langData)
      .map((l: any) => (typeof l === 'string' ? l : l?.name || l?.common || ''))
      .filter(Boolean)
      .join(', ');
  }

  // 6. Resolve Top Level Domain
  const tldRaw = currentCountry.topLevelDomain || currentCountry.tld;
  let tldDisplay = 'N/A';
  if (Array.isArray(tldRaw)) {
    tldDisplay = tldRaw.join(', ');
  } else if (typeof tldRaw === 'string') {
    tldDisplay = tldRaw;
  }

  // 7. Resolve Borders
  const rawBorders = currentCountry.borders || currentCountry.border_countries || [];
  const borderCountries = Array.isArray(rawBorders)
    ? rawBorders.map((borderItem: any) => {
        const borderCode = typeof borderItem === 'string' ? borderItem : borderItem?.code || borderItem?.cca3;
        const found: any = (countries as any[]).find((c) => {
          const cCode = c.cca3 || c.alpha3Code || c.code;
          return cCode?.toUpperCase() === borderCode?.toUpperCase();
        });
        const resolvedBorderName = found
          ? typeof found.name === 'string'
            ? found.name
            : found.name?.common || borderCode
          : borderCode;
        return { code: borderCode, name: resolvedBorderName || borderCode };
      })
    : [];

  const flagSrc =
    currentCountry.flags?.svg ||
    currentCountry.flags?.png ||
    (typeof currentCountry.flag === 'string' && currentCountry.flag.startsWith('http') ? currentCountry.flag : '');

  return (
    <main style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <section style={styles.detailGrid} aria-label={`Details for ${displayName}`}>
        <div style={styles.flagWrapper}>
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={currentCountry.flags?.alt || `Flag of ${displayName}`}
              style={styles.flagImg}
            />
          ) : (
            <div style={styles.noFlag}>No Flag Available</div>
          )}
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
                <strong>Capital:</strong> {capitalDisplay || 'N/A'}
              </p>
            </div>

            <div style={styles.column}>
              <p style={styles.metaItem}>
                <strong>Top Level Domain:</strong> {tldDisplay}
              </p>
              <p style={styles.metaItem}>
                <strong>Currencies:</strong> {currencies || 'N/A'}
              </p>
              <p style={styles.metaItem}>
                <strong>Languages:</strong> {languages || 'N/A'}
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
  noFlag: {
    width: '100%',
    height: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2e8f0',
    color: 'var(--input-color)',
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