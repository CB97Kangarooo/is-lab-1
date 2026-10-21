import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { HeroesPage } from './pages/HeroesPage';
import { CarsPage } from './pages/CarsPage';
import { SpecialPage } from './pages/SpecialPage';
import { ConnectionStatus } from './components/ConnectionStatus';
import { RealtimeProvider } from './realtime/RealtimeProvider';

const NAV = [
  { to: '/heroes', label: 'Герои' },
  { to: '/cars', label: 'Машины' },
  { to: '/special', label: 'Спецоперации' },
];

export function App() {
  return (
    <RealtimeProvider>
      <HashRouter>
        <header className="topbar">
          <div className="shell topbar-inner">
            <span className="topbar-brand">
              <span className="wordmark">human_being</span>
              <ConnectionStatus />
            </span>
            <nav aria-label="Разделы">
              {NAV.map((item) => (
                <NavLink key={item.to} to={item.to} className="nav-link">
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>
        <main className="shell">
          <Routes>
            <Route path="/heroes" element={<HeroesPage />} />
            <Route path="/cars" element={<CarsPage />} />
            <Route path="/special" element={<SpecialPage />} />
            <Route path="*" element={<Navigate to="/heroes" replace />} />
          </Routes>
        </main>
      </HashRouter>
    </RealtimeProvider>
  );
}
