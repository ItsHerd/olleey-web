"use client";

import React from "react";
import { Crown, LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, getInitialsAvatar } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AccountView({ theme }: { theme: string }) {
  const { user, signOut } = useAuth();
  const isDark = theme === "dark";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-white";

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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-serif ${textClass} mb-2`}>Account</h1>
        <p className={mutedTextClass}>Profile, plan, and session controls.</p>
      </div>

      <Card className={cn("p-5 border mb-4", borderClass, cardBgClass)}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
            <img src={accountAvatar} alt={accountName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className={cn("font-semibold text-base truncate", textClass)}>{accountName}</p>
            <p className={cn("text-sm truncate", mutedTextClass)}>{accountEmail}</p>
          </div>
          <Badge variant="secondary" className="ml-auto">Active</Badge>
        </div>
      </Card>

      <Card className={cn("p-5 border mb-4", borderClass, cardBgClass)}>
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
            <Crown className={cn("w-4 h-4", mutedTextClass)} />
          </div>
          <div className="flex-1">
            <p className={cn("text-sm font-semibold", textClass)}>Plan</p>
            <p className={cn("text-sm mt-1", mutedTextClass)}>Olleey Pro subscription and billing live here.</p>
          </div>
        </div>
      </Card>

      <Card className={cn("p-5 border", borderClass, cardBgClass)}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg border", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200")}>
              <User className={cn("w-4 h-4", mutedTextClass)} />
            </div>
            <div>
              <p className={cn("text-sm font-semibold", textClass)}>Session</p>
              <p className={cn("text-sm mt-1", mutedTextClass)}>Sign out of this device.</p>
            </div>
          </div>
          <Button variant="destructive" onClick={() => signOut()} className="gap-2 shrink-0">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
