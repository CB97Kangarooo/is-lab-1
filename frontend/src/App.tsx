import { HashRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { HeroesPage } from './pages/HeroesPage';
import { CarsPage } from './pages/CarsPage';
import { SpecialPage } from './pages/SpecialPage';
import { LoginPage } from './pages/LoginPage';
import { ConnectionStatus } from './components/ConnectionStatus';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { RealtimeProvider } from './realtime/RealtimeProvider';

const NAV = [
  { to: '/heroes', label: 'Герои' },
  { to: '/cars', label: 'Машины' },
  { to: '/special', label: 'Спецоперации' },
];

export function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

function Gate() {
  const { state, retry } = useAuth();

  if (state.kind === 'loading') {
    return <p className="shell muted">Проверяем вход…</p>;
  }
  if (state.kind === 'failed') {
    return (
      <div className="shell">
        <div className="banner" role="alert">
          {state.message}
          <button type="button" className="btn" onClick={retry}>
            повторить
          </button>
        </div>
      </div>
    );
  }
  if (state.kind === 'anonymous') {
    return <LoginPage />;
  }
  return <Workspace username={state.user.username} />;
}

function Workspace({ username }: { username: string }) {
  const { signOut } = useAuth();
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
              <span className="topbar-user">
                <span className="muted">{username}</span>
                <button type="button" className="btn" onClick={() => void signOut()}>
                  выйти
                </button>
              </span>
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
