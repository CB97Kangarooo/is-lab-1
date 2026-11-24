import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { login, register } from '../api/auth';
import { ApiError, errorMessage } from '../api/client';
import { Field } from '../components/Field';
import { useAuth } from '../auth/AuthProvider';

type Mode = 'login' | 'register';

export function LoginPage() {
  const { signIn } = useAuth();

  // Адрес мог остаться от рабочего экрана (#/heroes): на входе он ни к чему, после входа откроются «Герои».
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setMessage(null);
    setFieldErrors({});
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setFieldErrors({});
    try {
      const user = await (mode === 'login' ? login : register)(username, password);
      signIn(user);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setFieldErrors(error.fieldErrors);
      } else {
        setMessage(errorMessage(error));
      }
      setBusy(false);
    }
  };

  const isLogin = mode === 'login';
  return (
    <main className="shell auth">
      <h1 className="auth-title">human_being</h1>
      <form className="auth-form" onSubmit={submit} noValidate>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {message && (
          <div className="banner" role="alert">
            {message}
          </div>
        )}
        <Field id="auth-username" label="имя" error={fieldErrors.username}>
          {(control) => (
            <input
              {...control}
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          )}
        </Field>
        <Field id="auth-password" label="пароль" error={fieldErrors.password}>
          {(control) => (
            <input
              {...control}
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          )}
        </Field>
        <div className="auth-actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <button type="button" className="btn" onClick={switchMode} disabled={busy}>
            {isLogin ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Вход'}
          </button>
        </div>
      </form>
    </main>
  );
}
