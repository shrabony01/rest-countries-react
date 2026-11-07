import type{ Region } from '../types/country';

interface FilterDropdownProps {
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
}

const REGIONS: Region[] = ['All', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

export function FilterDropdown({ selectedRegion, onSelectRegion }: FilterDropdownProps) {
  return (
    <div style={styles.wrapper}>
      <select
        value={selectedRegion}
        onChange={(e) => onSelectRegion(e.target.value as Region)}
        style={styles.select}
        aria-label="Filter countries by region"
      >
        <option value="All">Filter by Region</option>
        {REGIONS.filter((r) => r !== 'All').map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    backgroundColor: 'var(--element-color)',
    borderRadius: '6px',
    boxShadow: 'var(--box-shadow)',
    display: 'inline-block',
  },
  select: {
    padding: '1rem 1.5rem',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    cursor: 'pointer',
  },
};