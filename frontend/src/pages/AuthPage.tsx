import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type AuthPageProps = {
  mode: 'login' | 'register';
};

export default function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (isRegister) {
        await register({ name, email, password });
      } else {
        await login({ email, password });
      }
      navigate('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-4 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">StockIQ</p>
          <h1 className="mt-3 text-3xl font-semibold">{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="mt-2 text-sm text-white/60">Secure access to your premium investing workspace.</p>
        </div>

        {isRegister ? (
          <label className="mb-4 block text-sm text-white/70">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-emerald-300"
              required
            />
          </label>
        ) : null}

        <label className="mb-4 block text-sm text-white/70">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-emerald-300"
            required
          />
        </label>

        <label className="mb-6 block text-sm text-white/70">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-emerald-300"
            required
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-emerald-300 px-4 py-3 font-semibold text-black transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Securing session...' : isRegister ? 'Create StockIQ account' : 'Sign in'}
        </button>

        <p className="mt-6 text-center text-sm text-white/60">
          {isRegister ? 'Already have an account?' : 'New to StockIQ?'}{' '}
          <Link className="font-medium text-emerald-300" to={isRegister ? '/login' : '/signup'}>
            {isRegister ? 'Sign in' : 'Create account'}
          </Link>
        </p>
      </form>
    </div>
  );
}
