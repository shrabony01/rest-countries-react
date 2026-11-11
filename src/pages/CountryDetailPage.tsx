import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Country } from '../types/country';
import { fetchAllCountries } from '../services/countryService';

export function CountryDetailPage() {
  const { countryCode } = useParams<{ countryCode: string }>();
  const navigate = useNavigate();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await fetchAllCountries();
        setCountries(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load country details.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.statusMessage}>Loading country details...</div>
      </main>
    );
  }

  if (error || !countryCode) {
    return (
      <main style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          &larr; Back
        </button>
        <div style={styles.errorMessage}>{error || 'Country not specified.'}</div>
      </main>
    );
  }

  const decodedParam = decodeURIComponent(countryCode).trim().toLowerCase();

  // Match by cca3, alpha3Code, cca2, alpha2Code, or name
  const country = countries.find((c: any) => {
    const rawName = typeof c.name === 'string' ? c.name : c.name?.common || c.name?.official || '';
    const cca3 = c.cca3 || c.alpha3Code || '';
    const cca2 = c.cca2 || c.alpha2Code || '';

    return (
      cca3.toLowerCase() === decodedParam ||
      cca2.toLowerCase() === decodedParam ||
      rawName.toLowerCase() === decodedParam
    );
  });

  if (!country) {
    return (
      <main style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          &larr; Back
        </button>
        <div style={styles.errorMessage}>Country "{countryCode}" not found.</div>
      </main>
    );
  }

  const raw = country as any;

  // Resolve Common Name
  const commonName =
    typeof raw.name === 'string'
      ? raw.name
      : raw.name?.common || raw.name?.official || 'Unknown Country';

  // Resolve Native Name
  let nativeName = raw.nativeName || '';
  if (!nativeName && raw.name?.nativeName && typeof raw.name.nativeName === 'object') {
    const firstObj = Object.values(raw.name.nativeName)[0] as any;
    nativeName = firstObj?.common || firstObj?.official || '';
  }
  if (!nativeName) nativeName = commonName;

  // Resolve Flags
  const flagSrc =
    (typeof raw.flags?.svg === 'string' && raw.flags.svg ? raw.flags.svg : null) ||
    (typeof raw.flags?.png === 'string' && raw.flags.png ? raw.flags.png : null) ||
    (typeof raw.flag === 'string' && raw.flag.startsWith('http') ? raw.flag : null) ||
    '';

  // Resolve Capital
  const capitalDisplay = Array.isArray(raw.capital)
    ? raw.capital.join(', ')
    : typeof raw.capital === 'string'
    ? raw.capital
    : 'N/A';

  // Resolve Currencies
  let currencyDisplay = 'N/A';
  if (typeof raw.currencies === 'string' && raw.currencies.trim() !== '') {
    currencyDisplay = raw.currencies;
  } else if (Array.isArray(raw.currencies)) {
    currencyDisplay = raw.currencies.map((c: any) => c.name || c.code || String(c)).join(', ');
  } else if (raw.currencies && typeof raw.currencies === 'object') {
    currencyDisplay = Object.values(raw.currencies)
      .map((c: any) => (typeof c === 'object' ? c.name || c.code || c.symbol : String(c)))
      .join(', ');
  }

  // Resolve Languages
  let languageDisplay = 'N/A';
  if (typeof raw.languages === 'string' && raw.languages.trim() !== '') {
    languageDisplay = raw.languages;
  } else if (Array.isArray(raw.languages)) {
    languageDisplay = raw.languages.map((l: any) => (typeof l === 'object' ? l.name : String(l))).join(', ');
  } else if (raw.languages && typeof raw.languages === 'object') {
    languageDisplay = Object.values(raw.languages)
      .map((l: any) => (typeof l === 'object' ? l.name : String(l)))
      .join(', ');
  }

  // Resolve Top Level Domain
  let tldDisplay = 'N/A';
  if (Array.isArray(raw.topLevelDomain)) {
    tldDisplay = raw.topLevelDomain.join(', ');
  } else if (typeof raw.topLevelDomain === 'string') {
    tldDisplay = raw.topLevelDomain;
  } else if (Array.isArray(raw.tld)) {
    tldDisplay = raw.tld.join(', ');
  }

  // Resolve Border Countries
  const rawBorders: string[] = Array.isArray(raw.borders) ? raw.borders : [];
  const borderCountries = rawBorders
    .map((borderCode) => {
      const codeClean = String(borderCode).trim().toLowerCase();
      return countries.find((c: any) => {
        const cName = typeof c.name === 'string' ? c.name : c.name?.common || '';
        const c3 = (c.cca3 || c.alpha3Code || '').toLowerCase();
        const c2 = (c.cca2 || c.alpha2Code || '').toLowerCase();
        return c3 === codeClean || c2 === codeClean || cName.toLowerCase() === codeClean;
      });
    })
    .filter((c): c is Country => Boolean(c));

  return (
    <main style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        &larr; Back
      </button>

      <section style={styles.contentGrid}>
        <div style={styles.flagWrapper}>
          {flagSrc ? (
            <img
              src={flagSrc}
              alt={raw.flags?.alt || `Flag of ${commonName}`}
              style={styles.flagImage}
            />
          ) : (
            <div style={styles.noFlag}>No Flag Available</div>
          )}
        </div>

        <div style={styles.infoWrapper}>
          <h1 style={styles.title}>{commonName}</h1>

          <div style={styles.columns}>
            <div style={styles.column}>
              <p style={styles.line}>
                <strong>Native Name:</strong> {nativeName}
              </p>
              <p style={styles.line}>
                <strong>Population:</strong>{' '}
                {typeof raw.population === 'number' ? raw.population.toLocaleString() : 'N/A'}
              </p>
              <p style={styles.line}>
                <strong>Region:</strong> {raw.region || 'N/A'}
              </p>
              <p style={styles.line}>
                <strong>Sub Region:</strong> {raw.subregion || 'N/A'}
              </p>
              <p style={styles.line}>
                <strong>Capital:</strong> {capitalDisplay}
              </p>
            </div>

            <div style={styles.column}>
              <p style={styles.line}>
                <strong>Top Level Domain:</strong> {tldDisplay}
              </p>
              <p style={styles.line}>
                <strong>Currencies:</strong> {currencyDisplay}
              </p>
              <p style={styles.line}>
                <strong>Languages:</strong> {languageDisplay}
              </p>
            </div>
          </div>

          <div style={styles.borderSection}>
            <strong style={styles.borderTitle}>Border Countries:</strong>
            <div style={styles.borderTags}>
              {borderCountries.length > 0 ? (
                borderCountries.map((b: any) => {
                  const bName = typeof b.name === 'string' ? b.name : b.name?.common || 'Country';
                  const bTarget = b.cca3 || b.alpha3Code || bName;
                  return (
                    <Link
                      key={bTarget}
                      to={`/country/${encodeURIComponent(bTarget)}`}
                      style={styles.borderButton}
                    >
                      {bName}
                    </Link>
                  );
                })
              ) : (
                <span style={{ color: 'var(--text-color)' }}>None</span>
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
    padding: '2rem 1.5rem',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.6rem 1.8rem',
    backgroundColor: 'var(--element-color)',
    color: 'var(--text-color)',
    border: 'none',
    borderRadius: '6px',
    boxShadow: 'var(--box-shadow)',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.95rem',
    marginBottom: '3.5rem',
  },
  contentGrid: {
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
  flagImage: {
    width: '100%',
    height: 'auto',
    maxHeight: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  noFlag: {
    width: '100%',
    height: '250px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#cbd5e1',
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
    margin: 0,
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  line: {
    fontSize: '0.95rem',
    color: 'var(--text-color)',
    margin: 0,
    lineHeight: 1.5,
  },
  borderSection: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.8rem',
    marginTop: '1.5rem',
  },
  borderTitle: {
    color: 'var(--text-color)',
    fontSize: '0.95rem',
  },
  borderTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  borderButton: {
    padding: '0.4rem 1.2rem',
    backgroundColor: 'var(--element-color)',
    color: 'var(--text-color)',
    borderRadius: '4px',
    boxShadow: 'var(--box-shadow)',
    textDecoration: 'none',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'inline-block',
  },
  statusMessage: {
    textAlign: 'center',
    padding: '4rem',
    fontSize: '1.2rem',
    color: 'var(--text-color)',
  },
  errorMessage: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.1rem',
    color: '#ef4444',
  },
};