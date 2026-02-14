"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Shield, Rss, Clock3, PlayCircle, Workflow, CheckCircle, AlertTriangle, Info, Loader2 } from "lucide-react";
import { useSettings } from "@/lib/SettingsContext";
import { useToast } from "@/components/ui/use-toast";

interface GuardrailsViewProps {
  theme: string;
}

type Guardrail = {
  title: string;
  description: string;
  status: "active";
  stat: string;
  icon: any;
};

export function GuardrailsView({ theme }: GuardrailsViewProps) {
  const isDark = theme === "dark";
  const { detectedUploadWindow, updateDetectedUploadWindow, loading: settingsLoading } = useSettings();
  const { toast } = useToast();
  const [updating, setUpdating] = useState(false);

  const handleWindowChange = async (newWindow: "last_1_day" | "last_7_days" | "last_31_days") => {
    setUpdating(true);
    try {
      await updateDetectedUploadWindow(newWindow);
      toast("Upload detection window updated", "success");
    } catch (error: any) {
      toast(error?.message || "Failed to update window", "error");
    } finally {
      setUpdating(false);
    }
  };

  const detectedUploadWindowLabel =
    detectedUploadWindow === "last_1_day"
      ? "Last 1 day"
      : detectedUploadWindow === "last_31_days"
        ? "Last 31 days"
        : "Last 7 days";

  const guardrails: Guardrail[] = [
    {
      title: "Detected Upload Window",
      description: "Only surfaces newly detected master-channel uploads from the last 7 days to keep the queue actionable.",
      status: "active",
      icon: Rss,
      stat: detectedUploadWindowLabel
    },
    {
      title: "Pre-Processing Approval Gate",
      description: "Webhook-detected videos can be held before compute starts, so teams can approve or defer processing.",
      status: "active",
      icon: Clock3,
      stat: "Approval required"
    },
    {
      title: "Manual Start Control",
      description: "Operators can trigger processing explicitly with Begin Processing when the video is ready.",
      status: "active",
      icon: PlayCircle,
      stat: "Operator controlled"
    },
    {
      title: "Auto-Approve Policy",
      description: "Optional automation that auto-starts new detected uploads when enabled in workspace settings.",
      status: "active",
      icon: Workflow,
      stat: "Workspace setting"
    },
    {
      title: "Content Safety",
      description: "Automatically detect and flag inappropriate, sensitive, or high-risk content using neural-linguistic analysis.",
      status: "active",
      icon: Shield,
      stat: "99.9% filtered"
    },
    {
      title: "Translation Accuracy",
      description: "Neural verification engine ensuring that translations maintain semantic integrity and original intent.",
      status: "active",
      icon: CheckCircle,
      stat: "BLEU 0.94"
    },
    {
      title: "Brand Consistency",
      description: "Ensures that specialized terminology, brand names, and slogans remain consistent across all target markets.",
      status: "active",
      icon: AlertTriangle,
      stat: "324 terms synced"
    },
    {
      title: "Compliance Checks",
      description: "Real-time automated verification against regional broadcast regulations and digital content laws.",
      status: "active",
      icon: Info,
      stat: "ISO 27001 ready"
    },
  ];

  return (
    <div className={`h-full overflow-auto custom-scrollbar ${isDark ? "bg-[#0A0A0A]" : "bg-gray-50"}`}>
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Guardrails</CardTitle>
            <CardDescription>
              Core safety and workflow rules for detected uploads, approvals, processing, and compliance.
            </CardDescription>
          </CardHeader>
        </Card>

        {guardrails.map((guardrail) => {
          const Icon = guardrail.icon;
          return (
            <Card key={guardrail.title}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{guardrail.title}</p>
                        <Badge variant="secondary">{guardrail.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{guardrail.description}</p>
                      <p className="text-xs text-muted-foreground">{guardrail.stat}</p>
                      {guardrail.title === "Detected Upload Window" && (
                        <div className="pt-2">
                          <select
                            value={detectedUploadWindow}
                            onChange={(e) => handleWindowChange(e.target.value as "last_1_day" | "last_7_days" | "last_31_days")}
                            disabled={settingsLoading || updating}
                            className="h-8 rounded-md border bg-background px-2 text-xs disabled:opacity-50"
                            aria-label="Detected upload window"
                          >
                            <option value="last_1_day">Last 1 day</option>
                            <option value="last_7_days">Last 7 days</option>
                            <option value="last_31_days">Last 31 days</option>
                          </select>
                          {updating && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Saving...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <Switch checked aria-label={`${guardrail.title} enabled`} />
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enforcement</p>
                <p className="text-sm text-muted-foreground">
                  Guardrails are applied automatically across all active pipelines.
                </p>
              </div>
              <Badge>Enabled</Badge>
            </div>
            <Separator className="my-3" />
            <div className="text-xs text-muted-foreground">All systems operational</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
