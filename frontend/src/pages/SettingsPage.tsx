import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, User } from 'lucide-react';
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
    </section>
  );
}
