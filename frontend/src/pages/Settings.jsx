import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Camera, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile',  label: 'Profile',       icon: User },
  { id: 'security', label: 'Security',       icon: Lock },
  { id: 'notifs',   label: 'Notifications',  icon: Bell },
  { id: 'privacy',  label: 'Privacy',        icon: Shield },
];

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setTimeout(() => {
      setProfileLoading(false);
      toast.success('Profile updated successfully');
    }, 900);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Nav */}
        <div className="lg:col-span-1">
          <Card hover={false}>
            <CardContent className="p-3">
              <div className="space-y-0.5">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === id
                        ? 'bg-primary/8 text-primary'
                        : 'text-muted hover:text-foreground hover:bg-background'
                    } ${id !== 'profile' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={id !== 'profile'}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-4">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Avatar Card */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
                        {initials}
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted hover:text-primary transition-colors shadow-sm">
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user?.name || 'User'}</p>
                      <p className="text-sm text-muted">{user?.email || ''}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-success" />
                        <span className="text-xs text-success font-medium">Pro Plan Active</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <Input
                      label="Full Name"
                      value={profileData.name}
                      onChange={e => setProfileData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      value={profileData.email}
                      onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))}
                      required
                    />
                    <div className="flex justify-end pt-1">
                      <Button type="submit" isLoading={profileLoading}>Save Changes</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Password Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      required
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      required
                    />
                    <div className="flex justify-end pt-1">
                      <Button type="submit" variant="secondary" isLoading={passwordLoading}>Update Password</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
