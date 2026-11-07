import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CountryDetailPage } from './pages/CountryDetailPage';
import { useCountries } from './hooks/useCountries';

export default function App() {
  const { countries, isLoading, error } = useCountries();

  return (
    <div className="app">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              countries={countries}
              isLoading={isLoading}
              error={error}
            />
          }
        />
        <Route
          path="/country/:countryCode"
          element={
            <CountryDetailPage
              countries={countries}
              isLoading={isLoading}
            />
          }
        />
      </Routes>
    </div>
  );
}