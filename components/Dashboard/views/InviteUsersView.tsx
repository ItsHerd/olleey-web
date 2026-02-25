"use client";

import React, { useState, useEffect } from "react";
import {
    UserPlus,
    Mail,
    Send,
    Check,
    Clock,
    Loader2,
    RefreshCw,
    Trash2,
    Copy,
    Shield,
    Users,
    X,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

interface Invitation {
    id: string;
    email: string;
    name?: string;
    status: "pending" | "accepted" | "expired";
    invitedAt: string;
    role: string;
}

const STORAGE_KEY = "olleey_invitations";

function loadInvitations(): Invitation[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveInvitations(invitations: Invitation[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invitations));
}

export function InviteUsersView({ theme }: { theme: string }) {
    const { user } = useAuth();
    const isDark = theme === "dark";
    const textClass = isDark ? "text-white" : "text-gray-900";
    const mutedTextClass = isDark ? "text-white/60" : "text-gray-500";
    const borderClass = isDark ? "border-zinc-700/80" : "border-gray-200";
    const cardBgClass = isDark ? "bg-white/[0.03]" : "bg-white";
    const tileBgClass = isDark ? "bg-white/[0.02]" : "bg-gray-50";

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        setInvitations(loadInvitations());
    }, []);

    const handleSendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) {
            setError("Email address is required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (invitations.some((inv) => inv.email === trimmedEmail && inv.status === "pending")) {
            setError("An invitation has already been sent to this email.");
            return;
        }

        setSending(true);

        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));

        const newInvitation: Invitation = {
            id: crypto.randomUUID(),
            email: trimmedEmail,
            name: name.trim() || undefined,
            status: "pending",
            invitedAt: new Date().toISOString(),
            role: "editor",
        };

        const updated = [newInvitation, ...invitations];
        setInvitations(updated);
        saveInvitations(updated);

        setSuccess(`Invitation sent to ${trimmedEmail}`);
        setEmail("");
        setName("");
        setSending(false);

        setTimeout(() => setSuccess(null), 4000);
    };

    const handleResend = async (id: string) => {
        const inv = invitations.find((i) => i.id === id);
        if (!inv) return;

        // Simulate resend
        await new Promise((r) => setTimeout(r, 500));
        setSuccess(`Invitation resent to ${inv.email}`);
        setTimeout(() => setSuccess(null), 3000);
    };

    const handleRevoke = (id: string) => {
        const updated = invitations.filter((i) => i.id !== id);
        setInvitations(updated);
        saveInvitations(updated);
    };

    const handleCopyLink = (id: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/register?invite=true`);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const pendingCount = invitations.filter((i) => i.status === "pending").length;
    const acceptedCount = invitations.filter((i) => i.status === "accepted").length;

    return (
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="mx-auto max-w-5xl p-8">
                <div className="flex flex-col gap-5">
                    {/* Overview stats */}
                    <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className={cn("rounded-xl border p-3", borderClass, isDark ? "bg-pink-500/10" : "bg-pink-50")}>
                                    <Users className={cn("h-6 w-6", isDark ? "text-pink-400" : "text-pink-600")} />
                                </div>
                                <div>
                                    <p className={cn("text-xl font-semibold tracking-tight", textClass)}>Team Management</p>
                                    <p className={cn("text-sm", mutedTextClass)}>
                                        Invite collaborators to your workspace. Invitees will receive an email with instructions to join.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                                    <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Pending</p>
                                    <p className={cn("mt-1 text-2xl font-bold tabular-nums", textClass)}>{pendingCount}</p>
                                </div>
                                <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                                    <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Accepted</p>
                                    <p className={cn("mt-1 text-2xl font-bold tabular-nums text-emerald-500")}>{acceptedCount}</p>
                                </div>
                                <div className={cn("rounded-lg border p-3", borderClass, tileBgClass)}>
                                    <p className={cn("text-[11px] uppercase tracking-widest", mutedTextClass)}>Your Role</p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Shield className={cn("h-4 w-4", isDark ? "text-amber-400" : "text-amber-600")} />
                                        <p className={cn("text-sm font-semibold", textClass)}>Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Send invite form */}
                    <Card className={cn("w-full border", borderClass, cardBgClass)}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-pink-500" />
                                Send Invitation
                            </CardTitle>
                            <CardDescription>Enter the email address of the person you want to invite.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <form onSubmit={handleSendInvite} className="space-y-4">
                                {error && (
                                    <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400 flex items-center gap-2">
                                        <X className="h-3.5 w-3.5 shrink-0" />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400 flex items-center gap-2">
                                        <Check className="h-3.5 w-3.5 shrink-0" />
                                        {success}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", mutedTextClass)} />
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="colleague@company.com"
                                                className="pl-10"
                                                disabled={sending}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-sm font-medium">
                                            Name <span className={cn("font-normal", mutedTextClass)}>(optional)</span>
                                        </Label>
                                        <Input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Jane Doe"
                                            disabled={sending}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <p className={cn("text-xs", mutedTextClass)}>
                                        Invitees will be added as <Badge variant="secondary" className="mx-1 h-5 text-[10px]">Editor</Badge> by default.
                                    </p>
                                    <Button type="submit" size="sm" className="gap-2" disabled={sending}>
                                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                                        {sending ? "Sending..." : "Send Invite"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Pending invitations */}
                    <Card className={cn("w-full border", borderClass, cardBgClass)}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                Pending Invitations
                                {pendingCount > 0 && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{pendingCount}</Badge>
                                )}
                            </CardTitle>
                            <CardDescription>Users who have been invited but have not yet accepted.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {invitations.length === 0 ? (
                                <div className={cn("rounded-lg border border-dashed p-8 text-center", borderClass)}>
                                    <UserPlus className={cn("mx-auto h-8 w-8 mb-3", mutedTextClass, "opacity-40")} />
                                    <p className={cn("text-sm font-medium", mutedTextClass)}>No invitations yet</p>
                                    <p className={cn("mt-1 text-xs", mutedTextClass, "opacity-70")}>
                                        Send your first invitation using the form above.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {invitations.map((inv) => (
                                        <div
                                            key={inv.id}
                                            className={cn(
                                                "rounded-lg border p-3 flex items-center gap-3 transition-all group",
                                                borderClass,
                                                tileBgClass,
                                                "hover:border-primary/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold",
                                                isDark ? "bg-white/10 text-white/70" : "bg-gray-200 text-gray-600"
                                            )}>
                                                {(inv.name?.[0] || inv.email[0]).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn("text-sm font-medium truncate", textClass)}>
                                                        {inv.name || inv.email}
                                                    </p>
                                                    <Badge
                                                        variant={inv.status === "accepted" ? "default" : "secondary"}
                                                        className={cn(
                                                            "h-5 px-1.5 text-[10px] uppercase tracking-wider shrink-0",
                                                            inv.status === "pending" && "text-amber-500 border-amber-500/30 bg-amber-500/10",
                                                            inv.status === "accepted" && "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                                                        )}
                                                    >
                                                        {inv.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className={cn("text-xs truncate", mutedTextClass)}>{inv.email}</p>
                                                    <span className={cn("text-[10px]", mutedTextClass, "opacity-50")}>•</span>
                                                    <p className={cn("text-[10px] shrink-0", mutedTextClass)}>
                                                        Invited {new Date(inv.invitedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleCopyLink(inv.id)}
                                                    title="Copy invite link"
                                                >
                                                    {copiedId === inv.id ? (
                                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Copy className={cn("h-3.5 w-3.5", mutedTextClass)} />
                                                    )}
                                                </Button>
                                                {inv.status === "pending" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleResend(inv.id)}
                                                        title="Resend invitation"
                                                    >
                                                        <RefreshCw className={cn("h-3.5 w-3.5", mutedTextClass)} />
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-red-500 hover:text-red-400"
                                                    onClick={() => handleRevoke(inv.id)}
                                                    title="Revoke invitation"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Info footer */}
                    <Card className={cn("w-full border p-6", borderClass, cardBgClass)}>
                        <div className="flex items-start gap-3">
                            <div className={cn("rounded-lg border p-2", borderClass, tileBgClass)}>
                                <Shield className={cn("h-4 w-4", mutedTextClass)} />
                            </div>
                            <div className="flex-1">
                                <p className={cn("text-sm font-semibold", textClass)}>About Invitations</p>
                                <p className={cn("mt-1 text-sm", mutedTextClass)}>
                                    Invited users will receive an email with a link to create their account and join your workspace.
                                    You can revoke pending invitations at any time.
                                </p>
                                <p className={cn("mt-2 text-xs", mutedTextClass, "opacity-70")}>
                                    Need to manage roles or permissions? Contact{" "}
                                    <a href="mailto:hello@olleey.com" className="underline hover:no-underline">
                                        hello@olleey.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
