"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Filter,
  LayoutGrid,
  LineChart,
  Plus,
  Star,
} from "lucide-react";

type MetricKey = "spend" | "roas" | "cpa" | "convert_score";

type CreativeCardData = {
  id: string;
  kind: "Static" | "Video";
  title: string;
  spend: string;
  roas: string;
  cpa: string;
  convertScore: number;
  thumbnailStyle: "wallets" | "materials" | "pans" | "bands";
};

const creativesSeed: CreativeCardData[] = [
  {
    id: "c1",
    kind: "Static",
    title: "Women's Wallets",
    spend: "$50,156",
    roas: "1.4",
    cpa: "$19",
    convertScore: 62,
    thumbnailStyle: "wallets",
  },
  {
    id: "c2",
    kind: "Video",
    title: "Quality Messaging",
    spend: "$14,849",
    roas: "2.1",
    cpa: "$12",
    convertScore: 73,
    thumbnailStyle: "materials",
  },
  {
    id: "c3",
    kind: "Static",
    title: "Hybrid Deep Pans",
    spend: "$35,834",
    roas: "1.7",
    cpa: "$17",
    convertScore: 60,
    thumbnailStyle: "pans",
  },
  {
    id: "c4",
    kind: "Video",
    title: "Wedding Bands",
    spend: "$104,536",
    roas: "1.1",
    cpa: "$33",
    convertScore: 73,
    thumbnailStyle: "bands",
  },
];

function MetricChip({
  index,
  label,
  active,
  onRemove,
}: {
  index: number;
  label: string;
  active?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
        active ? "bg-white" : "bg-white",
        "border-gray-200 shadow-[0_1px_0_rgba(0,0,0,0.04)]",
      ].join(" ")}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-dark-card text-dark-text text-xs font-normal">
        {index}
      </span>
      <span className="text-gray-900 font-medium">{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full text-dark-textSecondary hover:bg-dark-card"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

function DropdownButton({
  icon,
  label,
}: {
  icon?: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-[0_1px_0_rgba(0,0,0,0.04)] hover:bg-dark-card"
    >
      {icon}
      <span className="font-medium">{label}</span>
      <ChevronDown className="h-4 w-4 text-dark-textSecondary" />
    </button>
  );
}

function CreativeThumb({
  style,
  isVideo,
}: {
  style: CreativeCardData["thumbnailStyle"];
  isVideo: boolean;
}) {
  const bg = useMemo(() => {
    switch (style) {
      case "wallets":
        return "bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50";
      case "materials":
        return "bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500";
      case "pans":
        return "bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50";
      case "bands":
        return "bg-gradient-to-br from-amber-100 via-amber-50 to-stone-50";
      default:
        return "bg-dark-card";
    }
  }, [style]);

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl ${bg}`}>
      {/* Faux media content */}
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -left-12 top-10 h-24 w-40 rotate-[-18deg] rounded-2xl bg-white/40" />
        <div className="absolute left-16 top-16 h-36 w-56 rotate-[8deg] rounded-3xl bg-dark-bg/10" />
        <div className="absolute right-10 bottom-10 h-20 w-28 rotate-[14deg] rounded-2xl bg-white/30" />
      </div>

      {isVideo && (
        <div className="absolute left-4 bottom-4 flex items-center gap-2 rounded-full bg-dark-bg/45 px-2.5 py-1 text-xs text-dark-text">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/20">
            ▶
          </span>
          <span className="font-medium">Video</span>
        </div>
      )}

      {/* Progress scrub bar */}
      <div className="absolute left-4 right-4 bottom-3">
        <div className="h-1.5 w-full rounded-full bg-white/60">
          <div className="h-1.5 w-1/2 rounded-full bg-white" />
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-dark-textSecondary">
        {icon}
        <span>{label}</span>
      </div>
      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-emerald-700 font-normal">
        {value}
      </span>
    </div>
  );
}

export default function ReportsPage({
  reportName = "What's Working",
}: {
  reportName?: string;
}) {
  const [dateRangeLabel] = useState("Last 14 days");
  const [groupByLabel] = useState("Group by Ad name");
  const [metrics, setMetrics] = useState<MetricKey[]>([
    "spend",
    "roas",
    "cpa",
    "convert_score",
  ]);

  const metricLabels: Record<MetricKey, string> = {
    spend: "Spend",
    roas: "ROAS",
    cpa: "CPA",
    convert_score: "Convert score",
  };

  return (
    <div className="flex-1 min-h-0 bg-white">
      <div className="w-full h-full py-8">
        {/* Title */}
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-normal text-gray-900">
              Top creatives
            </h1>
            <p className="text-sm text-dark-textSecondary mt-1">
              This report shows top-spending creative with potential for real scale.
            </p>
            <p className="text-xs text-dark-textSecondary mt-1">Report: {reportName}</p>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <DropdownButton
            icon={<Calendar className="h-4 w-4 text-dark-textSecondary" />}
            label={dateRangeLabel}
          />
          <DropdownButton label={groupByLabel} />
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-dark-card text-gray-900 px-3 py-2 text-sm font-medium hover:bg-gray-200"
          >
            <Filter className="h-4 w-4" />
            Add filter
          </button>
        </div>

        {/* Metrics row */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)] mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {metrics.map((m, idx) => (
              <MetricChip
                key={m}
                index={idx + 1}
                label={metricLabels[m]}
                onRemove={
                  metrics.length > 1
                    ? () => setMetrics((prev) => prev.filter((x) => x !== m))
                    : undefined
                }
              />
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-700 hover:bg-dark-card"
            >
              <Plus className="h-4 w-4" />
              Add metric
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-dark-textSecondary hover:bg-dark-card"
              aria-label="Chart view"
            >
              <LineChart className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dark-card text-gray-900 hover:bg-gray-200"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {creativesSeed.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-[0_1px_0_rgba(0,0,0,0.04)]"
            >
              <div className="p-4">
                <CreativeThumb
                  style={c.thumbnailStyle}
                  isVideo={c.kind === "Video"}
                />
              </div>
              <div className="px-5 pb-5">
                <div className="text-sm text-dark-textSecondary mb-1">
                  {c.kind} |{" "}
                  <span className="text-gray-900 font-medium">{c.title}</span>
                </div>
                <div className="mt-4 space-y-2.5">
                  <MetricRow label="Spend" value={c.spend} />
                  <MetricRow label="ROAS" value={c.roas} />
                  <MetricRow label="CPA" value={c.cpa} />
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-dark-textSecondary">Convert score</div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-20 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className={[
                            "h-1.5 rounded-full",
                            c.convertScore >= 70
                              ? "bg-emerald-500"
                              : c.convertScore >= 60
                              ? "bg-amber-400"
                              : "bg-red-400",
                          ].join(" ")}
                          style={{ width: `${c.convertScore}%` }}
                        />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {c.convertScore}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

