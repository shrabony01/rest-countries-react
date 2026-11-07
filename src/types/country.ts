export interface CountryName {
  common: string;
  official?: string;
  nativeName?: Record<string, { official: string; common: string }>;
}

export interface CountryFlags {
  png: string;
  svg: string;
  alt?: string;
}

export interface CurrencyItem {
  name: string;
  symbol: string;
}

export interface Country {
  name: CountryName;
  tld?: string[];
  cca2?: string;
  cca3: string;
  ccn3?: string;
  capital?: string[];
  region: string;
  subregion?: string;
  languages?: Record<string, string>;
  borders?: string[];
  population: number;
  flags: CountryFlags;
  currencies?: Record<string, CurrencyItem>;
}

export type Region = 'All' | 'Africa' | 'Americas' | 'Asia' | 'Europe' | 'Oceania';