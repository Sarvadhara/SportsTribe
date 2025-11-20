"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "SportsTribe",
    siteDescription: "A next-gen sports community platform",
    maintenanceMode: false,
    allowRegistrations: true,
    defaultLanguage: "en",
    emailNotifications: true,
    maxUploadSize: "10",
    sessionTimeout: "30",
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default?")) {
      setSettings({
        siteName: "SportsTribe",
        siteDescription: "A next-gen sports community platform",
        maintenanceMode: false,
        allowRegistrations: true,
        defaultLanguage: "en",
        emailNotifications: true,
        maxUploadSize: "10",
        sessionTimeout: "30",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-st-white mb-2">Settings</h1>
        <p className="text-st-text/70">Manage website settings and preferences</p>
      </div>

      {/* General Settings */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-st-white mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-st-text/90 mb-2">Site Name</label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-st-text/90 mb-2">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-st-text/90 mb-2">Default Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>
      </div>

      {/* Site Features */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-st-white mb-4">Site Features</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-st-white mb-1">Maintenance Mode</label>
              <p className="text-xs text-st-text/70">Temporarily disable site access for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF6A3D] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FF6A3D] peer-checked:to-[#E94057]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-st-white mb-1">Allow New Registrations</label>
              <p className="text-xs text-st-text/70">Enable or disable new user registrations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistrations}
                onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF6A3D] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FF6A3D] peer-checked:to-[#E94057]"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium text-st-white mb-1">Email Notifications</label>
              <p className="text-xs text-st-text/70">Send email notifications for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#FF6A3D] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#FF6A3D] peer-checked:to-[#E94057]"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h2 className="text-xl font-bold text-st-white mb-4">Advanced Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-st-text/90 mb-2">Max Upload Size (MB)</label>
            <input
              type="number"
              value={settings.maxUploadSize}
              onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-st-text/90 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-st-white placeholder-st-text/50 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-[#FF6A3D] to-[#E94057] text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(255,106,61,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 bg-white/10 text-st-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}

