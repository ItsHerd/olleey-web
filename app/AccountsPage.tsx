"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";
import { Eye, EyeOff, LogOut, User } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";

interface AccountsPageProps {
  onLogout?: () => void;
}

export default function AccountsPage({ onLogout }: AccountsPageProps) {
  const { theme } = useTheme();
  const { dashboard } = useDashboard();
  
  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-dark-card";
  const cardAltClass = theme === "light" ? "bg-light-cardAlt" : "bg-dark-cardAlt";
  const textClass = theme === "light" ? "text-light-text" : "text-dark-text";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-dark-textSecondary";
  const borderClass = theme === "light" ? "border-light-border" : "border-dark-border";
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Auto-hide success message
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  // Get user info from dashboard
  const userEmail = dashboard?.email || "user@example.com";
  const userName = dashboard?.name || "Sidiq Moltafet";

  return (
    <div className={`flex-1 p-6 ${bgClass}`}>
      <div className="mb-6">
        <h2 className={`text-2xl font-normal ${textClass}`}>Account</h2>
        <p className={`text-sm ${textSecondaryClass} mt-1`}>Manage your account settings and security</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
          <h3 className={`text-lg font-normal ${textClass} mb-4 flex items-center gap-2`}>
            <User className="w-5 h-5" />
            Account Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Name
              </label>
              <div className={`px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass}`}>
                {userName}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Email
              </label>
              <div className={`px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass}`}>
                {userEmail}
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
          <h3 className={`text-lg font-normal ${textClass} mb-4`}>Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <div className={`px-4 py-2 rounded-lg bg-red-900/30 border border-red-700 text-sm text-red-200`}>
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className={`px-4 py-2 rounded-lg bg-green-900/30 border border-green-700 text-sm text-green-200`}>
                {passwordSuccess}
              </div>
            )}
            
            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10`}
                  placeholder="Enter current password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeOff className={`w-5 h-5 ${textSecondaryClass}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${textSecondaryClass}`} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10`}
                  placeholder="Enter new password (min. 8 characters)"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeOff className={`w-5 h-5 ${textSecondaryClass}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${textSecondaryClass}`} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${textSecondaryClass} mb-2`}>
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-2 ${bgClass} border ${borderClass} rounded-full text-sm ${textClass} focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10`}
                  placeholder="Confirm new password"
                  disabled={isChangingPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className={`w-5 h-5 ${textSecondaryClass}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${textSecondaryClass}`} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className={`w-full px-4 py-2 bg-indigo-500 ${textClass} rounded-full text-sm font-normal hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isChangingPassword ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className={`border-t ${borderClass}`}></div>

        {/* Logout */}
        <div className={`${cardClass} border ${borderClass} rounded-xl p-6`}>
          <h3 className={`text-lg font-normal ${textClass} mb-3`}>Sign Out</h3>
          <p className={`text-xs ${textSecondaryClass} mb-4`}>
            Sign out of your account. You'll need to sign in again to access your dashboard.
          </p>
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 ${cardAltClass} ${textClass} rounded-full text-sm font-normal border ${borderClass} hover:bg-red-900/20 hover:border-red-700 hover:text-red-400 transition-colors flex items-center justify-center gap-2`}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
