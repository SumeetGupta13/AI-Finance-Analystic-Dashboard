import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Moon, Settings, ShieldCheck, User } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { settingsService } from '../services/settingsService';

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [currency, setCurrency] = useState<'INR' | 'USD'>(user?.preferences.currency || 'INR');
  const [defaultMarket, setDefaultMarket] = useState<'IN' | 'US' | 'GLOBAL'>(user?.preferences.defaultMarket || 'IN');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'aggressive'>(user?.preferences.riskProfile || 'balanced');
  const [priceAlerts, setPriceAlerts] = useState(() => localStorage.getItem('stockiq_price_alerts') !== 'false');
  const [newsDigest, setNewsDigest] = useState(() => localStorage.getItem('stockiq_news_digest') !== 'false');
  const [riskAlerts, setRiskAlerts] = useState(() => localStorage.getItem('stockiq_risk_alerts') !== 'false');
  const [highContrastCharts, setHighContrastCharts] = useState(() => localStorage.getItem('stockiq_high_contrast_charts') === 'true');
  const [sessionAlerts, setSessionAlerts] = useState(() => localStorage.getItem('stockiq_session_alerts') !== 'false');
  const [orderConfirmation, setOrderConfirmation] = useState(() => localStorage.getItem('stockiq_order_confirmation') !== 'false');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAvatar(user.avatar || '');
      setCurrency(user.preferences.currency);
      setDefaultMarket(user.preferences.defaultMarket);
      setRiskProfile(user.preferences.riskProfile);
    }
  }, [user]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await settingsService.updateProfile({ name, avatar: avatar || undefined });
      await refreshProfile();
      toast.success('Profile updated');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingPreferences(true);
    try {
      await settingsService.updatePreferences({ currency, defaultMarket, riskProfile });
      await refreshProfile();
      toast.success('Preferences updated');
    } finally {
      setSavingPreferences(false);
    }
  };

  const saveWorkspaceSettings = () => {
    localStorage.setItem('stockiq_price_alerts', String(priceAlerts));
    localStorage.setItem('stockiq_news_digest', String(newsDigest));
    localStorage.setItem('stockiq_risk_alerts', String(riskAlerts));
    localStorage.setItem('stockiq_high_contrast_charts', String(highContrastCharts));
    localStorage.setItem('stockiq_session_alerts', String(sessionAlerts));
    localStorage.setItem('stockiq_order_confirmation', String(orderConfirmation));
    toast.success('Workspace settings saved');
  };

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300">Settings</p>
        <h1 className="mt-3 text-4xl font-semibold">Account preferences</h1>
        <p className="mt-2 text-white/56">Manage profile identity, market defaults, currency, and risk posture.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4 rounded-lg bg-white/[0.04] p-4">
                <div className="flex size-14 items-center justify-center rounded-md bg-emerald-300/10 text-emerald-300">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-semibold">{user?.email}</p>
                  <p className="text-sm text-white/48">JWT protected account</p>
                </div>
              </div>
              <label className="block text-sm text-white/64">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                  required
                />
              </label>
              <label className="block text-sm text-white/64">
                Avatar URL
                <input
                  value={avatar}
                  onChange={(event) => setAvatar(event.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-emerald-300"
                />
              </label>
              <Button type="submit" loading={savingProfile}>Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investment defaults</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePreferences} className="space-y-4">
              {[
                {
                  label: 'Currency',
                  value: currency,
                  setter: setCurrency,
                  options: ['INR', 'USD'],
                },
                {
                  label: 'Default market',
                  value: defaultMarket,
                  setter: setDefaultMarket,
                  options: ['IN', 'US', 'GLOBAL'],
                },
                {
                  label: 'Risk profile',
                  value: riskProfile,
                  setter: setRiskProfile,
                  options: ['conservative', 'balanced', 'aggressive'],
                },
              ].map((field) => (
                <label key={field.label} className="block text-sm text-white/64">
                  {field.label}
                  <select
                    value={field.value}
                    onChange={(event) => field.setter(event.target.value as never)}
                    className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/40 px-3 text-white outline-none"
                  >
                    {field.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <Button type="submit" loading={savingPreferences}>
                <Settings size={17} />
                Save preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Notification settings</CardTitle>
            <Bell size={18} className="text-emerald-300" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ['Price alerts', priceAlerts, setPriceAlerts],
              ['News digest', newsDigest, setNewsDigest],
              ['Risk alerts', riskAlerts, setRiskAlerts],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm">
                <span>{String(label)}</span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => (setter as (next: boolean) => void)(event.target.checked)}
                  className="size-4 accent-emerald-300"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Theme settings</CardTitle>
            <Moon size={18} className="text-indigo-200" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-white/10 bg-black/20 p-3">
              <p className="text-sm text-white/48">Theme</p>
              <p className="mt-2 font-semibold capitalize">{user?.preferences.theme || 'dark'} premium</p>
            </div>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm">
              <span>High contrast charts</span>
              <input
                type="checkbox"
                checked={highContrastCharts}
                onChange={(event) => setHighContrastCharts(event.target.checked)}
                className="size-4 accent-emerald-300"
              />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Security settings</CardTitle>
            <ShieldCheck size={18} className="text-emerald-300" />
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm">
              <span>Session alerts</span>
              <input
                type="checkbox"
                checked={sessionAlerts}
                onChange={(event) => setSessionAlerts(event.target.checked)}
                className="size-4 accent-emerald-300"
              />
            </label>
            <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 p-3 text-sm">
              <span>Order confirmation</span>
              <input
                type="checkbox"
                checked={orderConfirmation}
                onChange={(event) => setOrderConfirmation(event.target.checked)}
                className="size-4 accent-emerald-300"
              />
            </label>
            <Button type="button" variant="secondary" onClick={saveWorkspaceSettings} className="w-full">
              Save workspace settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
