import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Check, Mail, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthInput from '../components/auth/AuthInput';
import SocialButton from '../components/auth/SocialButton';
import { getAuthProviderUrl } from '../api/baseUrl';
import { useAuth } from '../context/AuthContext';
import authBg from '../assets/images/auth/auth-bg.png';

const getAuthUrl = (provider: 'google') => {
  return getAuthProviderUrl(provider);
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const socialLinks = useMemo(
    () => ({
      google: getAuthUrl('google'),
    }),
    []
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Enter your email and password.');
      return;
    }

    setSubmitting(true);

    try {
      await login({ email, password });
      if (rememberMe) {
        localStorage.setItem('stockiq_remembered_email', email);
      } else {
        localStorage.removeItem('stockiq_remembered_email');
      }
      navigate('/dashboard');
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = socialLinks.google;
  };

  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#020813] bg-cover bg-center bg-no-repeat text-white"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl sm:p-8"
        >
        <div className="mb-8 flex items-center justify-center gap-3 sm:mb-10 sm:gap-5">
          <div className="relative flex size-16 shrink-0 items-end justify-center text-emerald-300 sm:size-24">
            <BarChart3 className="size-12 sm:size-[72px]" strokeWidth={2.3} />
            <TrendingUp className="absolute -right-1 top-1 size-10 sm:size-[58px]" strokeWidth={2.7} />
          </div>
          <div className="min-w-0">
            <p className="text-3xl font-bold leading-none tracking-normal sm:text-5xl">
              Stock<span className="text-emerald-300">IQ</span>
            </p>
            <p className="mt-2 text-sm text-white/78 sm:text-xl">Analyze. Invest. Grow.</p>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-normal sm:text-4xl">Welcome back</h1>
          <p className="mt-3 text-base text-white/72">Login to continue your investment journey.</p>
        </div>

        <div className="space-y-7">
          <AuthInput
            label="Email"
            icon={Mail}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
          <AuthInput
            label="Password"
            icon={Mail}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="mt-7 flex flex-col items-start gap-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
          <label className="flex cursor-pointer items-center gap-3 text-white/86">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="peer sr-only"
            />
            <span className="flex size-5 items-center justify-center rounded-[5px] border border-emerald-200/70 bg-emerald-300 text-black shadow-[0_0_18px_rgba(52,211,153,0.22)] peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-200">
              {rememberMe ? <Check size={15} strokeWidth={3} /> : null}
            </span>
            Remember me
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 h-14 w-full rounded-lg bg-gradient-to-r from-[#66f283] to-[#25cde8] text-xl font-bold text-black shadow-[0_16px_35px_rgba(31,211,177,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>

        <div className="my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-white/74 sm:gap-5 sm:text-base">
          <span className="h-px bg-white/28" />
          <span>or continue with</span>
          <span className="h-px bg-white/28" />
        </div>

        <div className="space-y-3">
          <SocialButton
            provider="google"
            label="Continue with Google"
            href={socialLinks.google}
            onClick={(event) => {
              event.preventDefault();
              handleGoogleLogin();
            }}
          />
        </div>

        <p className="mt-7 text-center text-base text-white/82">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-emerald-300 transition hover:text-cyan-200">
            Sign Up
          </Link>
        </p>
        </motion.form>
      </div>
    </main>
  );
}
