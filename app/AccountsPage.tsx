"use client";

import { useState } from "react";
import { authAPI } from "@/lib/api";
import { useTheme } from "@/lib/useTheme";
import { CreditCard, Eye, EyeOff, LogOut, TrendingUp, User, Zap } from "lucide-react";
import { useDashboard } from "@/lib/useDashboard";

interface AccountsPageProps {
  onLogout?: () => void;
}

export default function AccountsPage({ onLogout }: AccountsPageProps) {
  const { theme } = useTheme();
  const { dashboard } = useDashboard();

  // Theme-aware classes
  const bgClass = theme === "light" ? "bg-light-bg" : "bg-dark-bg";
  const cardClass = theme === "light" ? "bg-light-card" : "bg-[#0c0c0c]";
  const borderClass = theme === "light" ? "border-light-border" : "border-white/5";
  const textClass = theme === "light" ? "text-light-text" : "text-white";
  const textSecondaryClass = theme === "light" ? "text-light-textSecondary" : "text-white/40";

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
    <div className={`h-full flex-1 p-6 ${bgClass} overflow-y-auto custom-scrollbar`}>
      <div className="max-w-4xl mx-auto w-full space-y-6 pb-20 pt-4">

        {/* Header Section */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-2xl font-normal text-white tracking-tighter mb-1">Account Settings</h1>
            <p className={`${textSecondaryClass} text-[13px] font-light tracking-tight opacity-60`}>
              Manage your personal security protocols and session data.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
            SECURE_MODE_ACTIVE
          </div>
        </div>

        {/* Profile Card */}
        <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl`}>
          <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <User className="w-40 h-40" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-full bg-olleey-yellow/10 border border-olleey-yellow/20 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
              <span className="text-3xl font-black text-olleey-yellow">
                {userName.charAt(0)}
              </span>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div>
                <h3 className="text-xl font-medium text-white mb-1">{userName}</h3>
                <p className="text-sm text-white/40 font-mono">{userEmail}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">User ID</label>
                  <div className="font-mono text-xs text-white/70 truncate">USR_{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-2">Role</label>
                  <div className="font-mono text-xs text-white/70">ADMINISTRATOR</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security Settings */}
          <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <CreditCard className="w-5 h-5 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white">Security Credentials</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {passwordError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                  ERROR: {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  SUCCESS: {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Current Key</label>
                  <div className="relative group/input">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 font-mono"
                      placeholder="Enter current password"
                      disabled={isChangingPassword}
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">New Key</label>
                  <div className="relative group/input">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 font-mono"
                      placeholder="Min. 8 characters"
                      disabled={isChangingPassword}
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Verify Key</label>
                  <div className="relative group/input">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10 font-mono"
                      placeholder="Confirm new password"
                      disabled={isChangingPassword}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-4 mt-2 bg-white text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>UPDATING...</span>
                  </>
                ) : (
                  <>
                    <span>UPDATE CREDENTIALS</span>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-black/5 transition-colors" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Session Management */}
          <div className={`${cardClass} border ${borderClass} rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-xl flex flex-col justify-between`}>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <LogOut className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-white">Session Control</h3>
              </div>

              <p className={`${textSecondaryClass} text-sm leading-relaxed mb-8 opacity-70`}>
                Terminating your session will require a full re-authentication sequence using your secure credentials or OAuth provider. All active dashboard streams will be paused.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 mb-4">
              <div className="flex items-center gap-3 text-red-400 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">Active Session</span>
              </div>
              <div className="font-mono text-xs text-white/40">started: {new Date().toLocaleTimeString()}</div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              TERMINATE SESSION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
