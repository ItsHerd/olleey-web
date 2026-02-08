"use client";
import { useState, useEffect, useMemo, Fragment } from "react";
import { useTheme } from "@/lib/useTheme";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnDef,
    flexRender,
    SortingState,
} from "@tanstack/react-table";
import {
    ChevronRight,
    ChevronDown,
    ArrowUpDown,
    Play,
    Eye,
    Globe,
    ChevronLeft,
    Clock,
    UserCircle2,
    CheckCircle2,
    Loader2,
    AlertCircle,
    PlayCircle,
    Zap,
    Activity,
    Layers,
    ExternalLink,
    Sparkles,
    Circle,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job, youtubeAPI, MasterNode, API_BASE_URL } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useVideos } from "@/lib/useVideos";
import { getLanguageFlag, LANGUAGE_OPTIONS } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

interface JobsTableProps {
    jobs: Job[];
    onViewWorkflow: (jobId: string) => void;
    onPreview: (job: Job) => void;
    projectId?: string;
}

interface VideoGroup {
    source_video_id: string;
    jobs: Job[];
    latest_created_at: string;
    total_languages: number;
    all_target_languages: string[];
    status_counts: Record<string, number>;
}

export function JobsTable({ jobs, onViewWorkflow, onPreview, projectId }: JobsTableProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { videos } = useVideos();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [expandedVideos, setExpandedVideos] = useState<Set<string>>(new Set());
    const [masterChannels, setMasterChannels] = useState<MasterNode[]>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Theme logic
    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-dark-bg" : "bg-white";
    const cardClass = isDark ? "bg-dark-card" : "bg-white";
    const textClass = isDark ? "text-dark-text" : "text-gray-900";
    const textHeadClass = isDark ? "text-gray-400" : "text-gray-500";
    const textSecondaryClass = isDark ? "text-dark-textSecondary" : "text-gray-500";
    const borderClass = isDark ? "border-dark-border" : "border-gray-200";
    const hoverClass = isDark ? "hover:bg-white/[0.03]" : "hover:bg-gray-50";
    const headerBgClass = isDark ? "bg-white/[0.02]" : "bg-gray-50/50";

    // Sub-row styling
    const subRowBg = isDark ? "bg-white/[0.01]" : "bg-gray-50/50";

    // Helper to construct full URL for storage paths
    const getFullUrl = (url: string | undefined) => {
        if (!url) return undefined;
        if (url.startsWith('http')) return url;
        return `${API_BASE_URL}${url}`;
    };

    // Load channel graph for language lookup
    useEffect(() => {
        const loadChannels = async () => {
            try {
                const response = await youtubeAPI.getChannelGraph(projectId);
                setMasterChannels(response.master_nodes || []);
            } catch (err) {
                console.error("Failed to load channels for language lookup", err);
            }
        };
        loadChannels();
    }, [projectId]);

    // Group jobs by video
    const videoGroups = useMemo(() => {
        const groups: Record<string, VideoGroup> = {};

        jobs.forEach(job => {
            if (!groups[job.source_video_id]) {
                groups[job.source_video_id] = {
                    source_video_id: job.source_video_id,
                    jobs: [],
                    latest_created_at: job.created_at,
                    total_languages: 0,
                    all_target_languages: [],
                    status_counts: {}
                };
            }
            groups[job.source_video_id].jobs.push(job);

            const languages = job.target_languages || [];
            groups[job.source_video_id].total_languages += languages.length;
            groups[job.source_video_id].all_target_languages.push(...languages);

            // Update status counts
            const status = job.status || 'pending';
            groups[job.source_video_id].status_counts[status] = (groups[job.source_video_id].status_counts[status] || 0) + languages.length;

            // Keep track of latest activity
            if (new Date(job.created_at) > new Date(groups[job.source_video_id].latest_created_at)) {
                groups[job.source_video_id].latest_created_at = job.created_at;
            }
        });

        // Deduplicate languages and sort
        Object.values(groups).forEach(group => {
            group.all_target_languages = Array.from(new Set(group.all_target_languages));
        });

        return Object.values(groups).sort((a, b) =>
            new Date(b.latest_created_at).getTime() - new Date(a.latest_created_at).getTime()
        );
    }, [jobs]);

    const toggleExpand = (videoId: string) => {
        const newSet = new Set(expandedVideos);
        if (newSet.has(videoId)) {
            newSet.delete(videoId);
        } else {
            newSet.add(videoId);
        }
        setExpandedVideos(newSet);
    };

    const getSourceLanguage = (videoId: string) => {
        const video = videos.find(v => v.video_id === videoId);
        if (video?.channel_id) {
            const channel = masterChannels.find(c => c.channel_id === video.channel_id);
            if (channel?.language_code) return channel.language_code;
        }
        return "en"; // Default
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const getStatusConfig = (status: string) => {
        const statusMap: Record<string, { label: string; className: string; dotColor: string; icon: any }> = {
            'processing': { label: 'In Production', className: isDark ? 'text-blue-400' : 'text-blue-600', dotColor: 'bg-blue-500', icon: Loader2 },
            'downloading': { label: 'Ingesting', className: isDark ? 'text-blue-300' : 'text-blue-500', dotColor: 'bg-blue-400', icon: Loader2 },
            'transcribing': { label: 'Transcribing', className: isDark ? 'text-indigo-400' : 'text-indigo-600', dotColor: 'bg-indigo-500', icon: Layers },
            'voice_cloning': { label: 'Voice Clone', className: isDark ? 'text-purple-400' : 'text-purple-600', dotColor: 'bg-purple-500', icon: Zap },
            'lip_sync': { label: 'Visual Sync', className: isDark ? 'text-pink-400' : 'text-pink-600', dotColor: 'bg-pink-500', icon: Activity },
            'pending': { label: 'In Queue', className: isDark ? 'text-zinc-500' : 'text-zinc-400', dotColor: 'bg-zinc-600', icon: Clock },
            'completed': { label: 'Released', className: isDark ? 'text-emerald-400' : 'text-emerald-600', dotColor: 'bg-emerald-500', icon: CheckCircle2 },
            'ready': { label: 'Ready', className: isDark ? 'text-emerald-400' : 'text-emerald-600', dotColor: 'bg-emerald-500', icon: CheckCircle2 },
            'failed': { label: 'System Halt', className: isDark ? 'text-red-400' : 'text-red-600', dotColor: 'bg-red-500', icon: AlertCircle },
            'waiting_approval': { label: 'QA Staged', className: isDark ? 'text-olleey-yellow' : 'text-amber-600', dotColor: 'bg-olleey-yellow', icon: Sparkles },
        };
        return statusMap[status] || { label: status, className: isDark ? 'text-zinc-400' : 'text-zinc-500', dotColor: 'bg-zinc-500', icon: Circle };
    };

    const getGroupStatusSummary = (counts: Record<string, number>) => {
        const processing = (counts['processing'] || 0) + (counts['downloading'] || 0) + (counts['transcribing'] || 0) + (counts['voice_cloning'] || 0) + (counts['lip_sync'] || 0) + (counts['pending'] || 0);
        const completed = (counts['completed'] || 0) + (counts['ready'] || 0);
        const failed = (counts['failed'] || 0);
        const waiting = (counts['waiting_approval'] || 0);

        return (
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                {processing > 0 && (
                    <div className="flex items-center gap-2 text-blue-500" title={`${processing} Processing`}>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>{processing} ACTIVE</span>
                    </div>
                )}
                {waiting > 0 && (
                    <div className="flex items-center gap-2 text-olleey-yellow" title={`${waiting} Needing Approval`}>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{waiting} QA</span>
                    </div>
                )}
                {completed > 0 && (
                    <div className="flex items-center gap-2 text-emerald-500" title={`${completed} Completed`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{completed} LIVE</span>
                    </div>
                )}
                {failed > 0 && (
                    <div className="flex items-center gap-2 text-red-500" title={`${failed} Failed`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{failed} ERR</span>
                    </div>
                )}
            </div>
        );
    };

    // Table Columns (Video Centric)
    const columns: ColumnDef<VideoGroup>[] = [
        {
            id: "expander",
            header: () => null,
            cell: ({ row }) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(row.original.source_video_id);
                        }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ${expandedVideos.has(row.original.source_video_id)
                            ? 'bg-olleey-yellow text-black'
                            : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {expandedVideos.has(row.original.source_video_id) ? (
                            <ChevronDown className="h-4 w-4 stroke-[3px]" />
                        ) : (
                            <ChevronRight className="h-4 w-4 stroke-[3px]" />
                        )}
                    </button>
                </div>
            ),
            size: 80,
        },
        {
            id: "video",
            header: () => <span className="pl-4">Master Asset</span>,
            cell: ({ row }) => {
                const group = row.original;
                const video = videos.find(v => v.video_id === group.source_video_id);
                return (
                    <div className="flex items-center gap-6 py-4 pl-4">
                        <div className={`relative w-28 aspect-video rounded-xl overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"} flex-shrink-0 shadow-xl border border-white/5`}>
                            {video?.thumbnail_url ? (
                                <img src={getFullUrl(video.thumbnail_url) || video.thumbnail_url} alt="" className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <PlayCircle className={`h-6 w-6 text-white/20`} />
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent p-2 flex items-end justify-end">
                                <span className="text-[9px] font-black text-white/40 font-mono tracking-tighter">MASTER</span>
                            </div>
                        </div>
                        <div className="flex flex-col min-w-0 gap-1.5">
                            <span className={`font-normal text-[15px] ${textClass} truncate max-w-[320px] tracking-tight`}>
                                {video?.title || "Unknown Asset"}
                            </span>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2`}>
                                    <Globe className="w-3.5 h-3.5" />
                                    {video?.channel_name || "PROD SOURCE"}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "targets",
            header: "Distribution Fabric",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 flex-wrap max-w-[240px]">
                    {row.original.all_target_languages.slice(0, 7).map(lang => (
                        <div key={lang} className="w-7 h-7 rounded-lg border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors" title={lang}>
                            <span className="text-xs">{getLanguageFlag(lang)}</span>
                        </div>
                    ))}
                    {row.original.all_target_languages.length > 7 && (
                        <span className={`text-[9px] font-black px-2 py-1.5 rounded-lg border border-white/5 bg-white/5 text-white/30 uppercase tracking-widest`}>
                            +{row.original.all_target_languages.length - 7} MORE
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "status",
            header: "Pipeline Pulse",
            cell: ({ row }) => getGroupStatusSummary(row.original.status_counts),
        },
        {
            accessorKey: "latest_created_at",
            header: ({ column }) => (
                <div className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    <span className="text-[11px] font-black uppercase tracking-widest">Temporal Index</span>
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                </div>
            ),
            cell: ({ row }) => (
                <div className={`flex items-center gap-3 text-sm text-white/40 font-light`}>
                    <Clock className="w-4 h-4 opacity-30" />
                    {formatDate(row.original.latest_created_at)}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: videoGroups,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        state: { sorting, pagination },
        onPaginationChange: setPagination,
    });

    const totalPages = table.getPageCount();
    const currentPage = pagination.pageIndex + 1;

    return (
        <div className={`w-full overflow-hidden transition-all duration-300`}>
            <Table className="min-w-[1000px] border-collapse">
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className={`hover:bg-transparent border-b border-white/5`}>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id} className={`h-14 px-8 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-white/20`}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map(row => {
                            const group = row.original;
                            const isExpanded = expandedVideos.has(group.source_video_id);

                            return (
                                <Fragment key={row.id}>
                                    {/* Parent Video Row */}
                                    <TableRow
                                        key={row.id}
                                        className={`
                                            group transition-all duration-500 border-b border-white/[0.03] cursor-pointer
                                            ${isExpanded ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}
                                        `}
                                        onClick={() => toggleExpand(group.source_video_id)}
                                    >
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id} className="py-2.5">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>

                                    {/* Child Jobs Rows */}
                                    <AnimatePresence>
                                        {isExpanded && group.jobs.map((job, jobIdx) => (
                                            (job.target_languages || []).map((lang, langIdx) => {
                                                const sourceLang = getSourceLanguage(group.source_video_id);
                                                const statusConfig = getStatusConfig(job.status);
                                                const uniqueKey = `${job.job_id}-${lang}-${langIdx}`;

                                                return (
                                                    <motion.tr
                                                        key={uniqueKey}
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3, delay: (jobIdx + langIdx) * 0.03 }}
                                                        className={`${subRowBg} border-b border-white/[0.02] last:border-b-0`}
                                                        style={{ display: "table-row" }}
                                                    >
                                                        <TableCell className="p-0 relative" colSpan={2}>
                                                            <div className="flex items-center h-full">
                                                                {/* Spacer for the expander column width (80px) */}
                                                                <div className="flex-shrink-0 w-[80px] relative h-full">
                                                                    <div className="absolute top-0 bottom-0 left-[2.5rem] w-px bg-white/5 group-hover:bg-olleey-yellow/20 transition-colors" />
                                                                    <div className="absolute top-[50%] left-[2.5rem] w-8 h-px bg-white/5 group-hover:bg-olleey-yellow/20 transition-colors" />
                                                                </div>

                                                                {/* Deployment Node */}
                                                                <div className="pl-6 py-4">
                                                                    <div className={`flex items-center gap-4 px-4 py-2.5 rounded-xl border transition-all duration-500 ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-olleey-yellow/20' : 'bg-white border-gray-100 shadow-sm'} group-hover:translate-x-1`}>
                                                                        <div className="flex items-center gap-2.5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                                                            <span className="text-lg leading-none">{getLanguageFlag(sourceLang)}</span>
                                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${textSecondaryClass}`}>{sourceLang}</span>
                                                                        </div>

                                                                        <div className="flex flex-col items-center gap-0.5 px-1">
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow/20" />
                                                                            <ArrowRight className={`w-3.5 h-3.5 text-olleey-yellow/40`} />
                                                                            <div className="w-1.5 h-1.5 rounded-full bg-olleey-yellow/20" />
                                                                        </div>

                                                                        <div className="flex items-center gap-2.5">
                                                                            <div className="w-7 h-7 rounded-lg bg-olleey-yellow/10 flex items-center justify-center border border-olleey-yellow/20 shadow-lg shadow-olleey-yellow/5">
                                                                                <span className="text-lg leading-none">{getLanguageFlag(lang)}</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className={`text-[10px] font-black uppercase tracking-widest ${textClass}`}>{LANGUAGE_OPTIONS.find(l => l.code === lang)?.name || lang}</span>
                                                                                <span className="text-[8px] font-medium text-white/20 uppercase tracking-tighter">Target Channel Sync</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell>{/* Alignment column */}</TableCell>

                                                        {/* Status Column */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-4 group/status">
                                                                <div className="relative">
                                                                    <div className={`w-2 h-2 rounded-full ${statusConfig.dotColor} ${['processing', 'waiting_approval'].includes(job.status) ? 'animate-pulse' : ''} shadow-[0_0_12px_currentColor]`} />
                                                                    {['processing', 'waiting_approval'].includes(job.status) && (
                                                                        <div className={`absolute inset-0 rounded-full ${statusConfig.dotColor} animate-ping opacity-20`} />
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${statusConfig.className}`}>
                                                                        {statusConfig.label}
                                                                    </span>
                                                                    <span className="text-[8px] font-mono font-medium text-white/20 uppercase tracking-tighter">IDX_{job.job_id.slice(0, 8).toUpperCase()}</span>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        {/* Action Column */}
                                                        <TableCell>
                                                            <div className="flex justify-end pr-8 gap-3">
                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onViewWorkflow(job.job_id);
                                                                    }}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`
                                                                        h-8 w-8 rounded-lg transition-all
                                                                        ${isDark
                                                                            ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-white/5"
                                                                            : "bg-white text-gray-400 hover:text-gray-900 border border-gray-200"
                                                                        }
                                                                    `}
                                                                    title="View Workflow Graph"
                                                                >
                                                                    <Layers className="w-3.5 h-3.5" />
                                                                </Button>

                                                                <Button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onPreview(job);
                                                                    }}
                                                                    variant="ghost"
                                                                    className={`
                                                                        flex items-center gap-2.5 px-5 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
                                                                        ${isDark
                                                                            ? "bg-olleey-yellow/5 text-olleey-yellow/60 hover:bg-olleey-yellow hover:text-black border border-olleey-yellow/10"
                                                                            : "bg-white text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 shadow-sm"
                                                                        }
                                                                        group/viewbtn
                                                                    `}
                                                                >
                                                                    <ExternalLink className="w-3 h-3 transition-transform group-hover/viewbtn:scale-110" />
                                                                    Inspect
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                );
                                            })
                                        ))}
                                    </AnimatePresence>
                                </Fragment>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-96 text-center">
                                <div className="flex flex-col items-center justify-center gap-6 opacity-30">
                                    <div className={`w-20 h-20 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center border border-white/10`}>
                                        <Layers className={`w-10 h-10 ${textSecondaryClass}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className={`text-xl font-normal text-white tracking-tighter`}>Production Archives Empty</p>
                                        <p className={`text-sm ${textSecondaryClass} font-light tracking-tight max-w-xs mx-auto`}>Zero active or completed workflows detected in the current project namespace.</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className={`mt-4 rounded-full border-white/10 hover:bg-olleey-yellow hover:text-black hover:border-olleey-yellow font-black uppercase tracking-widest text-[11px] h-12 px-8`}
                                        onClick={() => router.push('/app?page=Manual+Upload')}
                                    >
                                        Initiate Deployment
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`flex items-center justify-between px-10 py-6 border-t border-white/5 bg-white/[0.01]`}>
                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] text-white/20`}>
                        Indexing {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, videoGroups.length)} / {videoGroups.length} Registry Units
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/3 border border-white/5 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] text-white mx-2`}>
                            Node {currentPage} <span className="text-white/20">/</span> {totalPages}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/3 border border-white/5 text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
