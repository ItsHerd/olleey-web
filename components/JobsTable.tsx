"use client";
import { useState } from "react";
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
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable,
    SortingState,
} from "@tanstack/react-table";
import {
    ChevronRight,
    ArrowUpDown,
    Play,
    FileText,
    Edit2,
    Trash2,
    ChevronLeft,
    Eye,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Job } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useVideos } from "@/lib/useVideos";

interface JobsTableProps {
    jobs: Job[];
    onViewWorkflow: (jobId: string) => void;
}

export function JobsTable({ jobs, onViewWorkflow }: JobsTableProps) {
    const { theme } = useTheme();
    const router = useRouter();
    const { videos } = useVideos();
    const [sorting, setSorting] = useState<SortingState>([]);

    const isDark = theme === "dark";
    const bgClass = isDark ? "bg-dark-bg" : "bg-white";
    const cardClass = isDark ? "bg-dark-card" : "bg-white";
    const textClass = isDark ? "text-dark-text" : "text-gray-900";
    const textSecondaryClass = isDark ? "text-dark-textSecondary" : "text-gray-500";
    const borderClass = isDark ? "border-dark-border" : "border-gray-200";
    const hoverClass = isDark ? "hover:bg-white/5" : "hover:bg-gray-50";
    const headerBgClass = isDark ? "bg-white/5" : "bg-gray-50/50";
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const getLanguageFlags = (languages: string[]) => {
        const flagMap: Record<string, string> = {
            es: "🇪🇸",
            fr: "🇫🇷",
            de: "🇩🇪",
            pt: "🇵🇹",
            ja: "🇯🇵",
            ko: "🇰🇷",
            hi: "🇮🇳",
            ar: "🇸🇦",
            ru: "🇷🇺",
            it: "🇮🇹",
            zh: "🇨🇳",
            en: "🇺🇸",
        };
        return languages.map(lang => flagMap[lang.toLowerCase()] || "🌍");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusConfig = (status: string) => {
        const isDark = theme === "dark";
        const statusMap: Record<string, { label: string; className: string }> = {
            'processing': {
                label: 'Processing',
                className: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-600'
            },
            'downloading': {
                label: 'Downloading',
                className: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-600'
            },
            'transcribing': {
                label: 'Transcribing',
                className: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-600'
            },
            'voice_cloning': {
                label: 'Voice Cloning',
                className: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-600'
            },
            'lip_sync': {
                label: 'Lip Sync',
                className: isDark ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-orange-100 text-orange-600'
            },
            'pending': {
                label: 'Pending',
                className: isDark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-gray-100 text-gray-600'
            },
            'completed': {
                label: 'Completed',
                className: isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-green-600'
            },
            'ready': {
                label: 'Ready',
                className: isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-green-600'
            },
            'failed': {
                label: 'Failed',
                className: isDark ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-100 text-red-600'
            },
            'waiting_approval': {
                label: 'Approvals',
                className: isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-100 text-amber-600'
            },
        };
        return statusMap[status] || { label: status, className: isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-gray-100 text-gray-600' };
    };

    const columns: ColumnDef<Job>[] = [
        {
            id: "video",
            header: "Video Title",
            cell: ({ row }) => {
                const job = row.original;
                const video = videos.find(v => v.video_id === job.source_video_id);
                return (
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <div className={`relative w-14 h-10 rounded-md overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"} flex-shrink-0`}>
                            {video?.thumbnail_url ? (
                                <img
                                    src={video.thumbnail_url}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play className={`h-4 w-4 ${textSecondaryClass}`} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className={`font-medium text-sm ${textClass} truncate max-w-[250px]`}>
                                {video?.title || "Unknown Video"}
                            </span>
                            <span className={`text-xs ${textSecondaryClass} truncate`}>
                                {video?.channel_name || "Unknown Channel"}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "target_languages",
            header: "Languages",
            cell: ({ row }) => {
                const flags = getLanguageFlags(row.original.target_languages || []);
                return (
                    <div className="flex gap-1 text-base">
                        {flags.slice(0, 3).map((flag, idx) => (
                            <span key={idx} title={row.original.target_languages[idx]} className="drop-shadow-sm">{flag}</span>
                        ))}
                        {flags.length > 3 && (
                            <span className={`text-[10px] font-bold ${textSecondaryClass} ml-1`}>+{flags.length - 3}</span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={`-ml-4 hover:bg-transparent text-xs font-medium ${textSecondaryClass}`}
                    >
                        Order Date
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className={`text-sm ${textSecondaryClass}`}>
                    {formatDate(row.original.created_at)}
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const statusConfig = getStatusConfig(row.original.status);
                return (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                        {statusConfig.label}
                    </span>
                );
            },
        },
        {
            id: "payment",
            header: "Payment Status",
            cell: () => (
                <span className={`text-sm ${textSecondaryClass}`}>
                    Paid
                </span>
            ),
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => onViewWorkflow(job.job_id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isDark ? "bg-olleey-yellow/10 text-olleey-yellow hover:bg-olleey-yellow/20" : "bg-olleey-yellow text-black hover:opacity-90"} shadow-sm`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            View
                        </button>
                        <button
                            className={`p-1.5 ${hoverClass} rounded-lg transition-colors ${textSecondaryClass}`}
                            title="Delete"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className={`p-1.5 ${hoverClass} rounded-lg transition-colors ${textSecondaryClass}`}>
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: jobs,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
            pagination
        },
        onPaginationChange: setPagination,
    });

    const totalPages = table.getPageCount();
    const currentPage = pagination.pageIndex + 1;

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 7;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push('...');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <div className={`${cardClass} border-y ${borderClass} shadow-sm overflow-hidden`}>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className={`hover:bg-transparent border-b ${borderClass}`}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className={`text-[10px] font-bold uppercase tracking-wider ${textSecondaryClass} h-12 ${headerBgClass}`}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                className={`${hoverClass} transition-colors border-b ${borderClass} last:border-0`}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className={`h-32 text-center ${textSecondaryClass}`}>
                                No workflows found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className={`flex items-center justify-between px-6 py-4 border-t ${borderClass}`}>
                    <div className={`text-xs ${textSecondaryClass}`}>
                        Showing {pagination.pageIndex * pagination.pageSize + 1}-{Math.min((pagination.pageIndex + 1) * pagination.pageSize, jobs.length)} of {jobs.length} entries
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className={`px-3 py-1.5 text-xs font-medium ${textSecondaryClass} ${hoverClass} rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors`}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            Prev
                        </button>

                        <div className="flex items-center gap-1 px-2">
                            {getPageNumbers().map((page, idx) => (
                                page === '...' ? (
                                    <span key={`ellipsis-${idx}`} className={`px-2 text-[10px] ${textSecondaryClass}`}>...</span>
                                ) : (
                                    <button
                                        key={page}
                                        onClick={() => table.setPageIndex((page as number) - 1)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === page
                                            ? 'bg-olleey-yellow text-black shadow-sm'
                                            : `${textSecondaryClass} ${hoverClass}`
                                            }`}
                                    >
                                        {page}
                                    </button>
                                )
                            ))}
                        </div>

                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className={`px-3 py-1.5 text-xs font-medium ${textSecondaryClass} ${hoverClass} rounded-lg disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors`}
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
