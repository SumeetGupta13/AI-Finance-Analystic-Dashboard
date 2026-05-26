import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Check, Mail, TrendingUp, User } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthInput from '../components/auth/AuthInput';
import SocialButton from '../components/auth/SocialButton';
import { getAuthProviderUrl } from '../api/baseUrl';
import { useAuth } from '../context/AuthContext';
import authBg from '../assets/images/auth/auth-bg.png';

const getAuthUrl = (provider: 'google') => {
  return getAuthProviderUrl(provider);
};

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const socialLinks = useMemo(
    () => ({
      google: getAuthUrl('google'),
    }),
    []
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      toast.error('Complete all required fields.');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || password.length < 8) {
      toast.error('Password must be 8+ characters with uppercase, lowercase, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions.');
      return;
    }

    setSubmitting(true);

    try {
      await register({ name, email, password });
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
        <div className="mb-6 flex items-center justify-between gap-3">
          <p className="text-base font-bold uppercase tracking-normal text-emerald-300 sm:text-lg">Sign Up.</p>
          <div className="flex items-center gap-2 text-white">
            <div className="relative flex size-9 items-end justify-center text-emerald-300">
              <BarChart3 size={28} strokeWidth={2.3} />
              <TrendingUp size={23} className="absolute -right-1 top-0" strokeWidth={2.6} />
            </div>
            <span className="text-xl font-bold">
              Stock<span className="text-emerald-300">IQ</span>
            </span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-normal sm:text-4xl">Create your account</h1>
          <p className="mt-3 text-base text-white/78 sm:text-lg">Start your investment journey with us.</p>
        </div>

        <div className="space-y-6">
          <AuthInput
            label="Name"
            icon={User}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <AuthInput
            label="Confirm password"
            icon={Mail}
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-white/88 sm:items-center sm:text-base">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="peer sr-only"
            required
          />
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-[5px] border border-emerald-200/70 bg-emerald-300 text-black shadow-[0_0_18px_rgba(52,211,153,0.22)] peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-200 sm:mt-0">
            {acceptedTerms ? <Check size={15} strokeWidth={3} /> : null}
          </span>
          <span>
            I agree to the{' '}
            <Link to="/terms" className="font-medium text-emerald-300 transition hover:text-cyan-200">
              Terms &amp; Conditions
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-7 h-14 w-full rounded-lg bg-gradient-to-r from-[#66f283] to-[#25cde8] text-xl font-bold text-black shadow-[0_16px_35px_rgba(31,211,177,0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {submitting ? 'Creating account...' : 'Sign Up'}
        </button>

        <div className="my-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-white/74 sm:gap-5 sm:text-base">
          <span className="h-px bg-white/28" />
          <span>or sign up with</span>
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
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emerald-300 transition hover:text-cyan-200">
            Log In
          </Link>
        </p>
        </motion.form>
      </div>
    </main>
  );
}
