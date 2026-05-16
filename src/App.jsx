import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InfoTVPage from './pages/InfoTVPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoTVPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}
