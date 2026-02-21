"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronRight,
  CreditCard,
  Crown,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Settings2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn, getInitialsAvatar } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ViewType } from "../DashboardLayout";

export function AccountView({
  theme,
  onViewChange,
}: {
  theme: string;
  onViewChange?: (view: ViewType) => void;
}) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isDark = theme === "dark";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-white/60" : "text-gray-500";
  const borderClass = isDark ? "border-zinc-700/80" : "border-gray-200";
  const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-white";
  const tileBgClass = isDark ? "bg-white/[0.02]" : "bg-gray-50";

  const accountName =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const accountEmail = user?.email || "";
  const accountAvatar =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    getInitialsAvatar(accountName);
  const accountProvider = user?.app_metadata?.provider || "email";
  const createdAtLabel = user?.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : "Unknown";
  const isPasswordAccount = accountProvider === "email";
  const quickActions = [
    {
      key: "analytics",
      title: "Open Analytics",
      description: "Pipeline outcomes and language demand",
      icon: BarChart3,
      onClick: () => onViewChange?.("analytics"),
    },
    {
      key: "preferences",
      title: "Open Preferences",
      description: "Workflow and quality controls",
      icon: Settings2,
      onClick: () => onViewChange?.("preferences"),
    },
  ] as const;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    try {
      setIsChangingPassword(true);
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to change password.";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-5xl p-8">
        <div className="flex flex-col gap-5">
        <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-20 w-20 rounded-2xl overflow-hidden bg-muted shrink-0 border border-black/10 dark:border-zinc-700/80">
                <img src={accountAvatar} alt={accountName} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("truncate text-2xl font-semibold tracking-tight", textClass)}>{accountName}</p>
                <p className={cn("truncate text-sm", mutedTextClass)}>{accountEmail}</p>
              </div>
              <Badge variant="secondary" className="h-6 px-2.5">
                Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Auth</p>
                <p className={cn("mt-1 text-sm font-medium capitalize", textClass)}>{accountProvider}</p>
              </div>
              <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Member Since</p>
                <p className={cn("mt-1 text-sm font-medium", textClass)}>{createdAtLabel}</p>
              </div>
              <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Workspace Role</p>
                <p className={cn("mt-1 text-sm font-medium", textClass)}>Owner</p>
              </div>
              <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Session</p>
                <p className={cn("mt-1 text-sm font-medium", textClass)}>This device</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
          <div className="space-y-3">
            <p className={cn("text-sm font-semibold", textClass)}>Quick Actions</p>
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  type="button"
                  variant="outline"
                  onClick={action.onClick}
                  className={cn(
                    "h-auto w-full justify-start gap-3 whitespace-normal rounded-lg px-3 py-3 text-left",
                    "border-border/60 bg-transparent hover:bg-muted/30 dark:border-zinc-700/80"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", mutedTextClass)} />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm font-medium leading-5", textClass)}>{action.title}</p>
                    <p className={cn("text-xs leading-4", mutedTextClass)}>{action.description}</p>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 shrink-0", mutedTextClass)} />
                </Button>
              );
            })}

            <Button size="sm" variant="destructive" onClick={handleSignOut} className="mt-2 w-fit gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </Card>

        <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg border p-2", borderClass, tileBgClass)}>
              <Crown className={cn("h-4 w-4", mutedTextClass)} />
            </div>
            <div className="flex-1">
              <p className={cn("text-sm font-semibold", textClass)}>Plan & Billing</p>
              <p className={cn("mt-1 text-sm", mutedTextClass)}>
                You are on Olleey Pro. Manage invoices and billing support from here.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">Olleey Pro</Badge>
                <Badge variant="secondary">Monthly</Badge>
              </div>
              <a
                href="mailto:hello@olleey.com?subject=Billing%20Support"
                className={cn("mt-4 inline-flex items-center gap-2 text-sm font-medium hover:opacity-80", textClass)}
              >
                <CreditCard className="h-4 w-4" />
                Contact billing support
              </a>
            </div>
          </div>
        </Card>

        <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg border p-2", borderClass, tileBgClass)}>
              <KeyRound className={cn("h-4 w-4", mutedTextClass)} />
            </div>
            <div className="flex-1">
              <p className={cn("text-sm font-semibold", textClass)}>Change Password</p>
              <p className={cn("mt-1 text-sm", mutedTextClass)}>
                Update your account password for this workspace login.
              </p>
              {!isPasswordAccount && (
                <p className={cn("mt-2 text-xs", mutedTextClass)}>
                  Password changes are only available for email/password accounts.
                </p>
              )}

              <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
                {passwordError && (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
                    {passwordSuccess}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className={cn("text-[11px]", mutedTextClass)}>Current password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-9"
                      disabled={!isPasswordAccount || isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                      className={cn("absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2", mutedTextClass)}
                      disabled={!isPasswordAccount || isChangingPassword}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={cn("text-[11px]", mutedTextClass)}>New password</label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="pr-9"
                      disabled={!isPasswordAccount || isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className={cn("absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2", mutedTextClass)}
                      disabled={!isPasswordAccount || isChangingPassword}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={cn("text-[11px]", mutedTextClass)}>Confirm new password</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="pr-9"
                      disabled={!isPasswordAccount || isChangingPassword}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className={cn("absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2", mutedTextClass)}
                      disabled={!isPasswordAccount || isChangingPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="mt-1 gap-2"
                  disabled={!isPasswordAccount || isChangingPassword}
                >
                  {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
          <div className="flex items-start gap-3">
            <div className={cn("rounded-lg border p-2", borderClass, tileBgClass)}>
              <Mail className={cn("h-4 w-4", mutedTextClass)} />
            </div>
            <div className="flex-1">
              <p className={cn("text-sm font-semibold", textClass)}>Need Help?</p>
              <p className={cn("mt-1 text-sm", mutedTextClass)}>
                For access changes or account issues, reach out to support.
              </p>
              <a
                href="mailto:hello@olleey.com?subject=Account%20Support"
                className={cn("mt-4 inline-flex items-center gap-2 text-sm font-medium hover:opacity-80", textClass)}
              >
                <Mail className="h-4 w-4" />
                hello@olleey.com
              </a>
            </div>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
