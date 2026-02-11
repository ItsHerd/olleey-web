"use client";

import React from "react";
import { Shield, CheckCircle, AlertTriangle, Info } from "lucide-react";

interface GuardrailsViewProps {
  theme: string;
}

export function GuardrailsView({ theme }: GuardrailsViewProps) {
  const isDark = theme === "dark";
  const bgClass = isDark ? "bg-[#0A0A0A]" : "bg-gray-50";
  const cardBgClass = isDark ? "bg-[#141414]" : "bg-white";
  const borderClass = isDark ? "border-white/10" : "border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const mutedTextClass = isDark ? "text-gray-500" : "text-gray-500";

  const guardrails = [
    {
      title: "Content Safety",
      description: "Automatically detect and flag inappropriate or sensitive content",
      status: "active",
      icon: Shield,
    },
    {
      title: "Translation Accuracy",
      description: "Verify translations maintain original meaning and context",
      status: "active",
      icon: CheckCircle,
    },
    {
      title: "Brand Consistency",
      description: "Ensure brand terms and messaging remain consistent across languages",
      status: "active",
      icon: AlertTriangle,
    },
    {
      title: "Compliance Checks",
      description: "Automated verification of regional content regulations",
      status: "active",
      icon: Info,
    },
  ];

  return (
    <div className={`h-full ${bgClass} p-8`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className={`text-3xl font-bold ${textClass}`}>Guardrails</h1>
          </div>
          <p className={`${mutedTextClass}`}>
            AI safety rules and automated compliance checks to ensure quality and consistency
          </p>
        </div>

        {/* Guardrails Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guardrails.map((guardrail) => {
            const Icon = guardrail.icon;
            return (
              <div
                key={guardrail.title}
                className={`${cardBgClass} border ${borderClass} rounded-2xl p-6 hover:border-green-500/30 transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-semibold">
                    {guardrail.status}
                  </span>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${textClass}`}>
                  {guardrail.title}
                </h3>
                <p className={`text-sm ${mutedTextClass}`}>
                  {guardrail.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className={`mt-8 ${cardBgClass} border ${borderClass} rounded-2xl p-6`}>
          <h3 className={`text-lg font-semibold mb-3 ${textClass}`}>
            How Guardrails Work
          </h3>
          <p className={`text-sm ${mutedTextClass} leading-relaxed`}>
            Guardrails are automated checks that run during the localization process to ensure
            quality, safety, and compliance. When a potential issue is detected, the job is
            flagged for manual review before publishing.
          </p>
        </div>
      </div>
    </div>
  );
}
