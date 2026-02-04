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
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job, youtubeAPI, MasterNode } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useVideos } from "@/lib/useVideos";
import { getLanguageFlag } from "@/lib/languages";
import { motion, AnimatePresence } from "framer-motion";

interface JobsTableProps {
    jobs: Job[];
    onViewWorkflow: (jobId: string) => void;
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

export function JobsTable({ jobs, onViewWorkflow, projectId }: JobsTableProps) {
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
    const hoverClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
    const headerBgClass = isDark ? "bg-white/5" : "bg-gray-50/50";
    
    // Sub-row styling
    const subRowBg = isDark ? "bg-[#0A0A0A]" : "bg-gray-50/50";

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

    const getLanguageFlags = (languages: string[]) => {
        const flagMap: Record<string, string> = {
            es: "🇪🇸", fr: "🇫🇷", de: "🇩🇪", pt: "🇵🇹", ja: "🇯🇵",
            ko: "🇰🇷", hi: "🇮🇳", ar: "🇸🇦", ru: "🇷🇺", it: "🇮🇹",
            zh: "🇨🇳", en: "🇺🇸",
        };
        return languages.map(lang => flagMap[lang.toLowerCase()] || "🌍");
    };

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
        const statusMap: Record<string, { label: string; className: string; dotColor: string }> = {
            'processing': { label: 'Processing', className: isDark ? 'text-orange-400' : 'text-orange-600', dotColor: 'bg-orange-500' },
            'downloading': { label: 'Downloading', className: isDark ? 'text-blue-400' : 'text-blue-600', dotColor: 'bg-blue-500' },
            'transcribing': { label: 'Transcribing', className: isDark ? 'text-indigo-400' : 'text-indigo-600', dotColor: 'bg-indigo-500' },
            'voice_cloning': { label: 'Cloning Voice', className: isDark ? 'text-purple-400' : 'text-purple-600', dotColor: 'bg-purple-500' },
            'lip_sync': { label: 'Lip Syncing', className: isDark ? 'text-pink-400' : 'text-pink-600', dotColor: 'bg-pink-500' },
            'pending': { label: 'Queued', className: isDark ? 'text-zinc-400' : 'text-zinc-500', dotColor: 'bg-zinc-500' },
            'completed': { label: 'Completed', className: isDark ? 'text-emerald-400' : 'text-emerald-600', dotColor: 'bg-emerald-500' },
            'ready': { label: 'Ready', className: isDark ? 'text-emerald-400' : 'text-emerald-600', dotColor: 'bg-emerald-500' },
            'failed': { label: 'Failed', className: isDark ? 'text-red-400' : 'text-red-600', dotColor: 'bg-red-500' },
            'waiting_approval': { label: 'Needs Approval', className: isDark ? 'text-amber-400' : 'text-amber-600', dotColor: 'bg-amber-500' },
        };
        return statusMap[status] || { label: status, className: isDark ? 'text-zinc-400' : 'text-zinc-500', dotColor: 'bg-zinc-500' };
    };

    // Helper to get aggregated status summary for parent row
    const getGroupStatusSummary = (counts: Record<string, number>) => {
        const processing = (counts['processing'] || 0) + (counts['downloading'] || 0) + (counts['transcribing'] || 0) + (counts['voice_cloning'] || 0) + (counts['lip_sync'] || 0) + (counts['pending'] || 0);
        const completed = (counts['completed'] || 0) + (counts['ready'] || 0);
        const failed = (counts['failed'] || 0);
        const waiting = (counts['waiting_approval'] || 0);

        return (
            <div className="flex items-center gap-3 text-xs">
                {processing > 0 && (
                    <div className="flex items-center gap-1.5 text-orange-500" title={`${processing} Processing`}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="font-medium">{processing}</span>
                    </div>
                )}
                {waiting > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-500" title={`${waiting} Needing Approval`}>
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="font-medium">{waiting}</span>
                    </div>
                )}
                {completed > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-500" title={`${completed} Completed`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-medium">{completed}</span>
                    </div>
                )}
                {failed > 0 && (
                    <div className="flex items-center gap-1.5 text-red-500" title={`${failed} Failed`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="font-medium">{failed}</span>
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
                        className={`p-1.5 rounded-md transition-all duration-200 ${
                            expandedVideos.has(row.original.source_video_id)
                                ? (isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-black')
                                : `${textSecondaryClass} hover:${textClass} hover:bg-white/5`
                        }`}
                    >
                        {expandedVideos.has(row.original.source_video_id) ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </button>
                </div>
            ),
            size: 50,
        },
        {
            id: "video",
            header: "Source Video",
            cell: ({ row }) => {
                const group = row.original;
                const video = videos.find(v => v.video_id === group.source_video_id);
                return (
                    <div className="flex items-center gap-4 py-2">
                        <div className={`relative w-24 h-14 rounded-lg overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"} flex-shrink-0 shadow-sm border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                            {video?.thumbnail_url ? (
                                <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover transition-transform hover:scale-105 duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play className={`h-5 w-5 ${textSecondaryClass}`} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0 gap-1">
                            <span className={`font-semibold text-sm ${textClass} truncate max-w-[300px]`}>
                                {video?.title || "Unknown Video"}
                            </span>
                             <span className={`text-xs ${textSecondaryClass} flex items-center gap-1.5`}>
                                   <UserCircle2 className="w-3.5 h-3.5 opacity-70" />
                                    {video?.channel_name || "Unknown Channel"}
                                </span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "targets",
            header: "Target Languages",
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 flex-wrap max-w-[200px]">
                    {row.original.all_target_languages.slice(0, 5).map(lang => (
                        <div key={lang} className="text-xl leading-none filter drop-shadow-sm select-none" title={lang}>
                            {getLanguageFlags([lang])[0]}
                        </div>
                    ))}
                    {row.original.all_target_languages.length > 5 && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${textSecondaryClass}`}>
                            +{row.original.all_target_languages.length - 5}
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => getGroupStatusSummary(row.original.status_counts),
        },
        {
            accessorKey: "latest_created_at",
            header: ({ column }) => (
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    <span>Last Active</span>
                    <ArrowUpDown className="h-3 w-3 opacity-50" />
                </div>
            ),
            cell: ({ row }) => (
                <div className={`flex items-center gap-2 text-sm ${textSecondaryClass}`}>
                    <Clock className="w-3.5 h-3.5 opacity-50" />
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
        <div className={`${cardClass} border ${borderClass} rounded-xl shadow-sm overflow-hidden custom-scrollbar transition-all duration-300`}>
            <Table className="min-w-[900px]">
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id} className={`hover:bg-transparent border-b ${borderClass}`}>
                            {headerGroup.headers.map(header => (
                                <TableHead key={header.id} className={`h-11 ${headerBgClass} text-[11px] font-semibold uppercase tracking-wider ${textHeadClass}`}>
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
                                            group transition-all duration-200 border-b ${borderClass} cursor-pointer
                                            ${isExpanded ? (isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50') : 'hover:bg-black/[0.01] dark:hover:bg-white/[0.01]'}
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
                                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                                        transition={{ 
                                                            duration: 0.2, 
                                                            delay: (jobIdx + langIdx) * 0.05,
                                                            ease: "easeOut" 
                                                        }}
                                                        className={`${subRowBg} border-b ${borderClass}/50 last:border-b-0`}
                                                        style={{ display: "table-row" }}
                                                    >
                                                        {/* Combined First Cell: Expander + Video/Flow Alignment */}
                                                        {/* This spans the first two columns of the parent table to control alignment */}
                                                        <TableCell className="p-0 relative" colSpan={2}>
                                                            <div className="flex items-center h-full">
                                                                {/* Spacer for the expander column width (50px) */}
                                                                <div className="flex-shrink-0 w-[50px] relative h-full">
                                                                    {/* Connector Lines */}
                                                                    <div className="absolute top-0 bottom-0 left-[2rem] w-[1px] bg-indigo-500/20 dark:bg-indigo-400/10"></div>
                                                                    <div className="absolute top-[50%] left-[2rem] w-8 h-[1px] bg-indigo-500/20 dark:bg-indigo-400/10"></div>
                                                                </div>

                                                                {/* Content starts here, aligned better with video title */}
                                                                <div className="pl-6 py-3">
                                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-gray-200'} shadow-sm`}>
                                                                        <div className="flex items-center gap-1.5 opacity-60 grayscale">
                                                                            <span className="text-sm">{getLanguageFlag(sourceLang)}</span>
                                                                            <span className={`text-[10px] font-bold uppercase ${textSecondaryClass}`}>{sourceLang}</span>
                                                                        </div>
                                                                        
                                                                        <ChevronRight className={`w-3 h-3 ${textSecondaryClass} opacity-30`} />
                                                                        
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="text-lg leading-none filter drop-shadow-sm">{getLanguageFlags([lang])[0]}</span>
                                                                            <span className={`text-xs font-bold uppercase ${textClass}`}>{lang}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        
                                                        {/* Remaining cells shift over */}
                                                        <TableCell>{/* Intentionally empty to align columns if needed, or we can merge cols */}</TableCell>
                                                        
                                                        {/* Status Column */}
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} animate-pulse shadow-[0_0_5px_currentColor]`}></span>
                                                                <span className={`text-xs font-medium ${statusConfig.className}`}>
                                                                    {statusConfig.label}
                                                                </span>
                                                            </div>
                                                        </TableCell>

                                                        {/* Action Column */}
                                                        <TableCell>
                                                            <div className="flex justify-end pr-4">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onViewWorkflow(job.job_id);
                                                                    }}
                                                                    className={`
                                                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all
                                                                        ${isDark 
                                                                            ? "bg-white/5 text-gray-300 hover:bg-olleey-yellow/10 hover:text-olleey-yellow border border-white/5 hover:border-olleey-yellow/20" 
                                                                            : "bg-white text-gray-600 hover:text-black border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
                                                                        }
                                                                    `}
                                                                >
                                                                    <Eye className="w-3 h-3" />
                                                                    View
                                                                </button>
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
                            <TableCell colSpan={columns.length} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center`}>
                                        <Globe className={`w-6 h-6 ${textSecondaryClass} opacity-40`} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className={`text-sm font-medium ${textClass}`}>No workflows found</p>
                                        <p className={`text-xs ${textSecondaryClass}`}>Start a new translation job to see it here.</p>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        className={`mt-2 ${isDark ? 'border-white/10 hover:bg-white/5' : ''}`}
                                        onClick={() => router.push('/app?page=Manual+Upload')}
                                    >
                                        Create New Job
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

             {/* Pagination */}
             {totalPages > 1 && (
                <div className={`flex items-center justify-between px-6 py-3 border-t ${borderClass} bg-opacity-50`}>
                    <div className={`text-[11px] ${textSecondaryClass}`}>
                        Showing {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, videoGroups.length)} of {videoGroups.length}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={`p-1.5 rounded-md ${textSecondaryClass} ${hoverClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className={`text-xs font-medium px-2 ${textSecondaryClass}`}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={`p-1.5 rounded-md ${textSecondaryClass} ${hoverClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
