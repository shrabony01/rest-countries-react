interface SearchBarProps {
  value: string;
  onChange: (query: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div style={styles.wrapper}>
      <span style={styles.icon}>🔍</span>
      <input
        type="text"
        placeholder="Search for a country..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
        aria-label="Search for a country"
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--element-color)',
    borderRadius: '6px',
    boxShadow: 'var(--box-shadow)',
    width: '100%',
    maxWidth: '480px',
  },
  icon: {
    position: 'absolute',
    left: '1.5rem',
    fontSize: '1rem',
    color: 'var(--input-color)',
  },
  input: {
    width: '100%',
    padding: '1rem 1rem 1rem 3.5rem',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '0.875rem',
    color: 'var(--text-color)',
  },
};