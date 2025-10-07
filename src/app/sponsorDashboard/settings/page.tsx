'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiBell,
  FiShield,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiSettings,
  FiHeart,
  FiCalendar,
  FiLock,
  FiSmartphone,
  FiMonitor,
  FiMoon,
  FiSun
} from 'react-icons/fi';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  organization: string;
  bio: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  emergencyAlerts: boolean;
  stockAlerts: boolean;
  achievementNotifications: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'sponsors-only';
  showContributions: boolean;
  showImpactMetrics: boolean;
  allowDataSharing: boolean;
  marketingCommunications: boolean;
}

interface PreferenceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  reportFrequency: 'weekly' | 'monthly' | 'quarterly';
}

export default function SponsorSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'preferences' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);

  // Profile settings
  const [profile, setProfile] = useState<UserProfile>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    organization: '',
    bio: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    emergencyAlerts: true,
    stockAlerts: true,
    achievementNotifications: true
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'sponsors-only',
    showContributions: true,
    showImpactMetrics: true,
    allowDataSharing: false,
    marketingCommunications: false
  });

  // Preference settings
  const [preferences, setPreferences] = useState<PreferenceSettings>({
    theme: 'system',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    reportFrequency: 'monthly'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }));
    }
  }, [session]);

  const handleSave = async (section: string) => {
    setLoading(true);
    setSaveStatus('saving');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Here you would make actual API calls to save the settings
      console.log(`Saving ${section} settings:`, {
        profile,
        notifications,
        privacy,
        preferences
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      console.error('Error saving settings');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveStatus('error');
      return;
    }

    setLoading(true);
    setSaveStatus('saving');

    try {
      // Simulate password change API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSaveStatus('saved');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const SaveButton = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        saveStatus === 'saved'
          ? 'bg-green-600 text-white'
          : saveStatus === 'error'
          ? 'bg-red-600 text-white'
          : saveStatus === 'saving'
          ? 'bg-blue-600 text-white'
          : 'bg-green-600 hover:bg-green-700 text-white'
      }`}
    >
      {saveStatus === 'saving' ? (
        <FiRefreshCw className="w-4 h-4 animate-spin" />
      ) : saveStatus === 'saved' ? (
        <FiCheck className="w-4 h-4" />
      ) : saveStatus === 'error' ? (
        <FiX className="w-4 h-4" />
      ) : (
        <FiSave className="w-4 h-4" />
      )}
      <span>
        {saveStatus === 'saving'
          ? 'Saving...'
          : saveStatus === 'saved'
          ? 'Saved!'
          : saveStatus === 'error'
          ? 'Error'
          : 'Save Changes'}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and notification settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-2">
                {[
                  { key: 'profile', label: 'Profile', icon: FiUser },
                  { key: 'notifications', label: 'Notifications', icon: FiBell },
                  { key: 'privacy', label: 'Privacy', icon: FiShield },
                  { key: 'preferences', label: 'Preferences', icon: FiSettings },
                  { key: 'security', label: 'Security', icon: FiLock }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as 'profile' | 'notifications' | 'privacy' | 'preferences' | 'security')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === key
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                    <SaveButton onClick={() => handleSave('profile')} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <FiPhone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={profile.organization}
                        onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Organization or company name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Tell us about yourself and your mission..."
                    />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Notification Preferences</h2>
                    <SaveButton onClick={() => handleSave('notifications')} />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Communication Methods</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', label: 'Email Notifications', icon: FiMail, desc: 'Receive updates via email' },
                          { key: 'smsNotifications', label: 'SMS Notifications', icon: FiSmartphone, desc: 'Get text message alerts' },
                          { key: 'pushNotifications', label: 'Push Notifications', icon: FiMonitor, desc: 'Browser and app notifications' }
                        ].map(({ key, label, icon: Icon, desc }) => (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-800">{label}</p>
                                <p className="text-sm text-gray-600">{desc}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[key as keyof NotificationSettings] as boolean}
                                onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Report Settings</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'weeklyReports', label: 'Weekly Impact Reports', icon: FiCalendar, desc: 'Summary of farm activities and impact' },
                          { key: 'monthlyReports', label: 'Monthly Analytics', icon: FiCalendar, desc: 'Detailed monthly performance reports' },
                          { key: 'emergencyAlerts', label: 'Emergency Alerts', icon: FiAlertTriangle, desc: 'Urgent farm situations and emergencies' },
                          { key: 'stockAlerts', label: 'Stock Alerts', icon: FiHeart, desc: 'Low inventory and restocking reminders' },
                          { key: 'achievementNotifications', label: 'Achievement Updates', icon: FiHeart, desc: 'Milestones and success stories' }
                        ].map(({ key, label, icon: Icon, desc }) => (
                          <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-800">{label}</p>
                                <p className="text-sm text-gray-600">{desc}</p>
                              </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications[key as keyof NotificationSettings] as boolean}
                                onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Privacy Settings</h2>
                    <SaveButton onClick={() => handleSave('privacy')} />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => setPrivacy(prev => ({ ...prev, profileVisibility: e.target.value as 'public' | 'private' | 'sponsors-only' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="public">Public - Visible to everyone</option>
                        <option value="sponsors-only">Sponsors Only - Visible to other sponsors</option>
                        <option value="private">Private - Only visible to you</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'showContributions', label: 'Show My Contributions', desc: 'Display your sponsorship contributions publicly' },
                        { key: 'showImpactMetrics', label: 'Show Impact Metrics', desc: 'Share your farm impact statistics' },
                        { key: 'allowDataSharing', label: 'Allow Data Sharing', desc: 'Share anonymized data for research purposes' },
                        { key: 'marketingCommunications', label: 'Marketing Communications', desc: 'Receive promotional updates and offers' }
                      ].map(({ key, label, desc }) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">{label}</p>
                            <p className="text-sm text-gray-600">{desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={privacy[key as keyof PrivacySettings] as boolean}
                              onChange={(e) => setPrivacy(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Preferences</h2>
                    <SaveButton onClick={() => handleSave('preferences')} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'light', label: 'Light', icon: FiSun },
                          { value: 'dark', label: 'Dark', icon: FiMoon },
                          { value: 'system', label: 'System', icon: FiMonitor }
                        ].map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            onClick={() => setPreferences(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))}
                            className={`flex flex-col items-center space-y-2 p-3 border rounded-lg transition-all ${
                              preferences.theme === value
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferences.currency}
                        onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={preferences.dateFormat}
                        onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Report Frequency
                      </label>
                      <select
                        value={preferences.reportFrequency}
                        onChange={(e) => setPreferences(prev => ({ ...prev, reportFrequency: e.target.value as 'weekly' | 'monthly' | 'quarterly' }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Security</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <FiLock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <button
                          onClick={handlePasswordChange}
                          disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                            Enable 2FA
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Active Sessions</p>
                            <p className="text-sm text-gray-600">Manage your active login sessions</p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 font-medium">
                            View Sessions
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Login Alerts</p>
                            <p className="text-sm text-gray-600">Get notified of new login attempts</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}