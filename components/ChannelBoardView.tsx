import { useState, useMemo } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
    DropAnimation
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTheme } from '@/lib/useTheme';
import { MasterNode, LanguageChannel } from '@/lib/api';
import { Plus, GripVertical, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Types ---
type BoardItem = {
    id: string;
    type: 'master' | 'satellite' | 'dependent';
    label: string;
    avatar: string;
    subLabel?: string;
    parentId?: string; // For satellites
    raw: MasterNode | LanguageChannel;
};

type BoardColumn = {
    id: 'primary' | 'secondary' | 'dependent';
    title: string;
    items: BoardItem[];
};

// --- Sortable Item Component ---
const SortableItem = ({ item }: { item: BoardItem }) => {
    const { theme } = useTheme();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id, data: { item } });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const bgClass = theme === "light" ? "bg-white" : "bg-gray-800";
    const borderClass = theme === "light" ? "border-gray-200" : "border-gray-700";
    const textClass = theme === "light" ? "text-gray-900" : "text-gray-100";

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`opacity-50 h-[72px] rounded-xl border-2 border-dashed ${borderClass} bg-gray-50/50`}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative flex items-center gap-3 p-3 rounded-xl border ${borderClass} ${bgClass} shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group`}
        >
            {/* Grip Handle */}
            <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={16} />
            </div>

            <img
                src={item.avatar}
                alt={item.label}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${textClass} truncate`}>{item.label}</div>
                <div className="text-xs text-gray-500 truncate">{item.subLabel}</div>
            </div>
        </div>
    );
};

// --- Column Component ---
const Column = ({ column, onAdd }: { column: BoardColumn; onAdd: () => void }) => {
    const { theme } = useTheme();
    const bgClass = theme === "light" ? "bg-gray-50/50" : "bg-gray-900/50";
    const textClass = theme === "light" ? "text-gray-900" : "text-gray-100";

    return (
        <div className={`flex flex-col h-full min-w-[300px] w-1/3 rounded-xl ${bgClass} p-4`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${textClass}`}>{column.title}</h3>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        {column.items.length}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onAdd}
                    className="h-8 w-8 rounded-md"
                >
                    <Plus size={16} />
                </Button>
            </div>

            <SortableContext
                items={column.items.map(i => i.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                    {column.items.map((item) => (
                        <SortableItem key={item.id} item={item} />
                    ))}
                    {column.items.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8 border-2 border-dashed border-gray-200/50 rounded-xl">
                            <span className="text-sm">No channels</span>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
};

// --- Main Board Component ---
export function ChannelBoardView({ masters, onAddConnection }: { masters: MasterNode[], onAddConnection: () => void }) {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Transform API data into board state
    // In a real app with local state mutations, we'd use useState here and update it on drag end
    // For now, we project props to state to allow UI interaction (even if it resets on reload)

    const initialColumns: Record<string, BoardColumn> = useMemo(() => {
        // 1. Primary
        const primaryItems: BoardItem[] = masters.map(m => ({
            id: m.connection_id,
            type: 'master',
            label: m.channel_name,
            avatar: m.channel_avatar_url || '',
            subLabel: `${m.language_channels.length} Satellites`,
            raw: m
        }));

        // 2. Secondary (Flattened Satellites)
        const secondaryItems: BoardItem[] = masters.flatMap(m =>
            m.language_channels.map(l => ({
                id: l.id,
                type: 'satellite',
                label: l.channel_name,
                avatar: l.channel_avatar_url || '',
                subLabel: l.language_name || 'Linked',
                parentId: m.connection_id,
                raw: l
            }))
        );

        // 3. Dependent (Mock/Empty for now as API doesn't support level 3 yet)
        // We could potentially filter for satellites that have their own "satellites" if the API supported recursive structures
        const dependentItems: BoardItem[] = [];

        return {
            primary: { id: 'primary', title: 'Primary Languages', items: primaryItems },
            secondary: { id: 'secondary', title: 'Child Channels', items: secondaryItems },
            dependent: { id: 'dependent', title: 'Dependent on Second', items: dependentItems },
        };
    }, [masters]);

    const [columns, setColumns] = useState(initialColumns);

    // Update local state if props change (re-sync)
    useMemo(() => {
        setColumns(initialColumns);
    }, [initialColumns]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // Find the containers
        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over.id as string) || (over.id as string); // If over a container itself

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Moving between columns logic would go here for visual feedback
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(over.id as string) || (over.id as string);

        if (activeContainer && overContainer) {
            // Logic to move items between lists locally
            // Note: This only updates UI state. Real persistence would require API calls.
            if (activeContainer !== overContainer) {
                setColumns((prev) => {
                    const activeItems = prev[activeContainer].items;
                    const overItems = prev[overContainer].items;
                    const activeIndex = activeItems.findIndex(i => i.id === active.id);
                    const overIndex = overItems.findIndex(i => i.id === over.id);

                    let newIndex;
                    if (overIndex >= 0) {
                        newIndex = overIndex + (activeContainer === overContainer ? 0 : 1);
                    } else {
                        newIndex = overItems.length + 1;
                    }

                    return {
                        ...prev,
                        [activeContainer]: {
                            ...prev[activeContainer],
                            items: [
                                ...prev[activeContainer].items.filter(item => item.id !== active.id)
                            ]
                        },
                        [overContainer]: {
                            ...prev[overContainer],
                            items: [
                                ...prev[overContainer].items.slice(0, newIndex),
                                activeItems[activeIndex],
                                ...prev[overContainer].items.slice(newIndex, prev[overContainer].items.length)
                            ]
                        }
                    };
                });
            } else {
                // Reordering within same column
                const oldIndex = columns[activeContainer].items.findIndex(i => i.id === active.id);
                const newIndex = columns[overContainer].items.findIndex(i => i.id === over.id);

                if (oldIndex !== newIndex) {
                    setColumns((prev) => ({
                        ...prev,
                        [activeContainer]: {
                            ...prev[activeContainer],
                            items: arrayMove(prev[activeContainer].items, oldIndex, newIndex)
                        }
                    }));
                }
            }
        }

        setActiveId(null);
    };

    const findContainer = (id: string) => {
        if (id in columns) return id;
        return Object.keys(columns).find(key =>
            columns[key].items.find(item => item.id === id)
        );
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <div className="h-full p-6 w-full overflow-x-auto">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 h-full min-w-[900px]">
                    <Column column={columns.primary} onAdd={onAddConnection} />
                    <Column column={columns.secondary} onAdd={onAddConnection} />
                    <Column column={columns.dependent} onAdd={onAddConnection} />
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeId ? (
                        <SortableItem item={
                            Object.values(columns).flatMap(c => c.items).find(i => i.id === activeId)!
                        } />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
