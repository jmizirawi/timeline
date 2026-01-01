import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Person, TimelineEvent } from '../types';
import chronologyData from '../data/chronology';
import { countYears } from '../utils/time';
import { measureTextWidth } from '../utils/measure';

export const useTimelineStore = defineStore('timeline', () => {
    // State
    const people = ref<Person[]>([]);
    const events = ref<TimelineEvent[]>([]);
    const selectedEntity = ref<Person | TimelineEvent | null>(null);
    const highlightedId = ref<string | null>(null);

    // Viewport State
    const scale = ref(1.25); // pixels per year (25% default)
    const scrollX = ref(0);
    const navigationTarget = ref<{ year: number } | null>(null);

    // Configuration
    const startDate = -4026;
    const endDate = 2026;

    // Actions
    function loadData() {
        // In a real app, might fetch. Here we load import.
        people.value = chronologyData.people;
        events.value = chronologyData.events;
    }

    function selectEntity(entity: Person | TimelineEvent | null) {
        selectedEntity.value = entity;
        if (entity) {
            highlightedId.value = entity.id;
        }
    }

    function jumpToDate(year: number) {
        navigationTarget.value = { year };
    }

    function jumpToEntity(id: string) {
        // Find logic
        const p = people.value.find(x => x.id === id);
        if (p) {
            selectEntity(p);
            navigationTarget.value = { year: p.born };
            return;
        }
        const e = events.value.find(x => x.id === id);
        if (e) {
            selectEntity(e);
            navigationTarget.value = { year: e!.startDate };
            return;
        }
    }

    function setScale(newScale: number) {
        if (newScale < 0.1) newScale = 0.1;
        if (newScale > 100) newScale = 100;
        scale.value = newScale;
    }

    // Getters / Computed
    const totalYears = computed(() => {
        return countYears(endDate) - countYears(startDate);
    });

    const totalWidth = computed(() => {
        return totalYears.value * scale.value;
    });

    const layoutRows = computed(() => {
        const currentYear = new Date().getFullYear();
        const TEXT_PADDING_PX = 30; // buffer

        // 1. Prepare Entities
        const peopleEntities = people.value.map(p => {
            const isLiving = (p as any).living;
            return {
                ...p,
                type: 'person' as const,
                start: p.born,
                end: isLiving ? currentYear : (p.died ?? (p.born + 1))
            };
        }).sort((a, b) => a.start - b.start);

        const eventEntities = events.value.map(e => {
            const isOngoing = (e as any).ongoing;
            return {
                ...e,
                type: 'event' as const,
                start: e.startDate,
                end: isOngoing ? currentYear : (e.endDate ?? e.startDate)
            };
        }).sort((a, b) => a.start - b.start);

        // 2. Shared Layout State
        const rows: (Person | TimelineEvent)[][] = [];
        const rowOccupiedRanges: { start: number; end: number }[][] = [];

        // 3. Layout Function (Operates on shared state)
        function placeEntities(entities: any[]) {
            entities.forEach(entity => {
                // Calculate effective visual duration upfront
                const name = ('name' in entity) ? entity.name : entity.title;
                const pxWidth = measureTextWidth(name, '600 8px Noto Sans, serif');
                const estimatedTextWidth = pxWidth + TEXT_PADDING_PX;

                // Convert text pixel width to years width based on current scale
                const textDurationYears = estimatedTextWidth / scale.value;
                const duration = entity.end - entity.start;
                const effectiveDuration = Math.max(duration, textDurationYears);
                const gapYears = 50 / scale.value;

                const effectiveStart = entity.start;
                const effectiveEnd = effectiveStart + effectiveDuration + gapYears;

                // Find first row where this entity fits (no overlap with any existing item)
                let rowIndex = -1;
                for (let i = 0; i < rows.length; i++) {
                    const occupiedRanges = rowOccupiedRanges[i]!;
                    let hasCollision = false;

                    for (const range of occupiedRanges) {
                        // Check intersection: start1 < end2 && start2 < end1
                        if (effectiveStart < range.end && range.start < effectiveEnd) {
                            hasCollision = true;
                            break;
                        }
                    }

                    if (!hasCollision) {
                        rowIndex = i;
                        break;
                    }
                }

                if (rowIndex === -1) {
                    // Create new row
                    rowIndex = rows.length;
                    rows.push([]);
                    rowOccupiedRanges.push([]);
                }

                // Place entity
                rows[rowIndex]!.push(entity);
                rowOccupiedRanges[rowIndex]!.push({ start: effectiveStart, end: effectiveEnd });
            });
        }

        // 4. Place sequentially (People first, then Events fill gaps)
        placeEntities(peopleEntities);
        placeEntities(eventEntities);

        return rows;
    });

    return {
        people,
        events,
        scale,
        scrollX,
        startDate,
        endDate,
        totalWidth,
        layoutRows,
        today: 2026, // or computed
        selectedEntity,
        highlightedId,
        navigationTarget,
        selectEntity,
        loadData,
        setScale,
        jumpToDate,
        jumpToEntity,
    };
});
