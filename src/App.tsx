import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { CountryDetailPage } from './pages/CountryDetailPage';

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/country/:countryCode" element={<CountryDetailPage />} />
      </Routes>
    </div>
  );
}