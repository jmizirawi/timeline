<script setup lang="ts">
import { computed } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import { storeToRefs } from 'pinia';
import { formatYearLabel, formatDateWithCertainty } from '../utils/time';
import { getCategoryColor } from '../utils/colors';
import type { Person, TimelineEvent } from '../types';

const store = useTimelineStore();
const { selectedYear, aroundThisTimeMode, people, events, selectedEntity } = storeToRefs(store);

const RANGE = 50;

function close() {
  store.setSelectedYear(null);
}

const show = computed(() => selectedYear.value !== null && selectedEntity.value === null);

const yearLabel = computed(() => {
  if (selectedYear.value === null) return '';
  return formatYearLabel(selectedYear.value, true);
});

// --- People alive at the selected year ---
const alivepeople = computed(() => {
  const Y = selectedYear.value;
  if (Y === null) return [];
  const around = aroundThisTimeMode.value;
  return people.value.filter(p => {
    const born = p.born;
    const died = (p as any).living ? Infinity : (p.died ?? Infinity);
    if (around) {
      return born <= Y + RANGE && died >= Y - RANGE;
    }
    return born <= Y && died >= Y;
  });
});

// --- Events active at selected year (global events) ---
const activeEvents = computed(() => {
  const Y = selectedYear.value;
  if (Y === null) return [];
  const around = aroundThisTimeMode.value;
  return events.value.filter(e => {
    const start = e.startDate;
    const end = (e as any).ongoing ? Infinity : (e.endDate ?? e.startDate);
    if (around) {
      return start <= Y + RANGE && end >= Y - RANGE;
    }
    return start <= Y && end >= Y;
  });
});

// --- Life events from all people at selected year ---
interface LifeEventEntry {
  kind: 'life';
  sortDate: number;
  person: Person;
  title: string;
  date: number;
  dateCertainty?: string;
  description?: string;
}

const lifeEventEntries = computed((): LifeEventEntry[] => {
  const Y = selectedYear.value;
  if (Y === null) return [];
  const around = aroundThisTimeMode.value;
  const results: LifeEventEntry[] = [];
  for (const p of people.value) {
    for (const le of p.lifeEvents) {
      if (le.startDate === undefined) continue;
      const d = le.startDate;
      const match = around ? (d >= Y - RANGE && d <= Y + RANGE) : d === Y;
      if (match) {
        results.push({ kind: 'life', sortDate: d, person: p, title: le.title, date: d, dateCertainty: le.startDateCertainty, description: le.description });
      }
    }
  }
  return results.sort((a, b) => a.sortDate - b.sortDate);
});

// --- Sub-events from all global events at selected year ---
interface SubEventEntry {
  kind: 'sub';
  sortDate: number;
  parentEvent: TimelineEvent;
  title: string;
  date: number;
  dateCertainty?: string;
  description?: string;
}

const subEventEntries = computed((): SubEventEntry[] => {
  const Y = selectedYear.value;
  if (Y === null) return [];
  const around = aroundThisTimeMode.value;
  const results: SubEventEntry[] = [];
  for (const ev of events.value) {
    if (!ev.subEvents) continue;
    for (const se of ev.subEvents) {
      if (se.startDate === undefined) continue;
      const d = se.startDate;
      const match = around ? (d >= Y - RANGE && d <= Y + RANGE) : d === Y;
      if (match) {
        results.push({ kind: 'sub', sortDate: d, parentEvent: ev, title: se.title, date: d, dateCertainty: se.startDateCertainty, description: se.description });
      }
    }
  }
  return results.sort((a, b) => a.sortDate - b.sortDate);
});

const hasNothing = computed(() =>
  alivepeople.value.length === 0 &&
  activeEvents.value.length === 0 &&
  lifeEventEntries.value.length === 0 &&
  subEventEntries.value.length === 0
);

function dotStyle(entity: any) {
  return { backgroundColor: getCategoryColor(entity) };
}

function personDates(p: Person) {
  const born = formatDateWithCertainty(p.born, p.bornCertainty);
  if ((p as any).living) return `${born} – Present`;
  if (p.died !== undefined) return `${born} – ${formatDateWithCertainty(p.died, p.diedCertainty)}`;
  return born;
}

function personAge(p: Person): number | null {
  const Y = selectedYear.value;
  if (Y === null) return null;
  if (p.born > Y) return null;
  const died = (p as any).living ? Infinity : (p.died ?? Infinity);
  if (died < Y) return null;
  return Y - p.born;
}

function eventDates(e: TimelineEvent) {
  const start = formatDateWithCertainty(e.startDate, e.startDateCertainty);
  if ((e as any).ongoing) return `${start} – Present`;
  if (e.endDate !== undefined) return `${start} – ${formatDateWithCertainty(e.endDate, e.endDateCertainty)}`;
  return start;
}
</script>

<template>
  <Transition
    enter-active-class="panel-transition-enter-active"
    enter-from-class="panel-transition-enter-from"
    enter-to-class="panel-transition-enter-to"
    leave-active-class="panel-transition-leave-active"
    leave-from-class="panel-transition-leave-from"
    leave-to-class="panel-transition-leave-to"
  >
    <div v-if="show" class="side-panel linen-texture">
      <!-- Header -->
      <div class="panel-header">
        <div class="header-left">
          <h2 class="panel-title">{{ yearLabel }}</h2>
          <div class="toggle-row">
            <button
              class="toggle-btn"
              :class="{ active: !aroundThisTimeMode }"
              @click="store.setAroundThisTimeMode(false)"
            >Exact year</button>
            <button
              class="toggle-btn"
              :class="{ active: aroundThisTimeMode }"
              @click="store.setAroundThisTimeMode(true)"
            >±50 years</button>
          </div>
        </div>
        <button @click="close" class="icon-btn">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Content -->
      <div class="panel-content">

        <!-- Empty state -->
        <p v-if="hasNothing" class="empty-state">Nothing found at this date.</p>

        <!-- People Alive -->
        <div v-if="alivepeople.length > 0">
          <h3 class="section-title">People Alive</h3>
          <div class="events-list">
            <div
              v-for="p in alivepeople"
              :key="p.id"
              class="event-item person-row"
              @click="store.jumpToEntity(p.id)"
            >
              <div class="timeline-dot" :style="dotStyle(p)"></div>
              <div>
                <p class="event-title">
                  {{ p.name }}
                  <span v-if="personAge(p) !== null" class="age-badge">age {{ personAge(p) }}</span>
                </p>
                <p class="event-age">{{ personDates(p) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Events -->
        <div v-if="activeEvents.length > 0">
          <h3 class="section-title">Events</h3>
          <div class="events-list">
            <div
              v-for="e in activeEvents"
              :key="e.id"
              class="event-item person-row"
              @click="store.jumpToEntity(e.id)"
            >
              <div class="timeline-dot" :style="dotStyle(e)"></div>
              <div>
                <p class="event-title">{{ e.title }}</p>
                <p class="event-age">{{ eventDates(e) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Life Events -->
        <div v-if="lifeEventEntries.length > 0">
          <h3 class="section-title">Life Events</h3>
          <div class="events-list">
            <div v-for="(le, idx) in lifeEventEntries" :key="idx" class="event-item">
              <div class="timeline-dot" :style="dotStyle(le.person)"></div>
              <div>
                <div class="event-header">
                  <h4 class="event-year">{{ formatDateWithCertainty(le.date, le.dateCertainty as any) }}</h4>
                </div>
                <p class="event-title">
                  <span class="parent-label" @click="store.jumpToEntity(le.person.id)">{{ le.person.name }}</span>
                  · {{ le.title }}
                </p>
                <p v-if="le.description" class="event-desc">{{ le.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sub-Events -->
        <div v-if="subEventEntries.length > 0">
          <h3 class="section-title">Sub-Events</h3>
          <div class="events-list">
            <div v-for="(se, idx) in subEventEntries" :key="idx" class="event-item">
              <div class="timeline-dot" :style="dotStyle(se.parentEvent)"></div>
              <div>
                <div class="event-header">
                  <h4 class="event-year">{{ formatDateWithCertainty(se.date, se.dateCertainty as any) }}</h4>
                </div>
                <p class="event-title">
                  <span class="parent-label" @click="store.jumpToEntity(se.parentEvent.id)">{{ se.parentEvent.title }}</span>
                  · {{ se.title }}
                </p>
                <p v-if="se.description" class="event-desc">{{ se.description }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.side-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-height: 50vh;
  height: auto;
  border-top: 1px solid $color-border-main;
  max-width: 100%;
  border-top-left-radius: 0.75rem;
  border-top-right-radius: 0.75rem;
  background-color: $color-bg-primary;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  z-index: 50;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    top: 0;
    bottom: 0;
    left: auto;
    right: 0;
    max-height: none;
    height: auto;
    width: 100%;
    max-width: 28rem;
    border-left: 1px solid $color-border-main;
    border-top: 0;
    border-radius: 0;
  }
}

.panel-transition-enter-active,
.panel-transition-leave-active {
  transition: transform 300ms ease-in-out;
  @media (min-width: 640px) {
    transition-duration: 500ms;
  }
}

.panel-transition-enter-from,
.panel-transition-leave-to {
  transform: translateY(100%);
  @media (min-width: 768px) {
    transform: translateY(0) translateX(100%);
  }
}

.panel-transition-enter-to,
.panel-transition-leave-from {
  transform: translateY(0);
  @media (min-width: 768px) {
    transform: translateY(0) translateX(0);
  }
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid $color-border-main;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background-color: rgba($color-bg-secondary, 0.3);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.panel-title {
  font-size: $font-size-2xl;
  font-weight: bold;
  color: $color-fg-primary;
}

.toggle-row {
  display: flex;
  gap: 0.25rem;
}

.toggle-btn {
  font-size: $font-size-xs;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid $color-border-main;
  background: transparent;
  color: $color-fg-secondary;
  cursor: pointer;
  transition: all 0.15s;

  &.active {
    background-color: $color-fg-accent;
    border-color: $color-fg-accent;
    color: $color-bg-primary;
    font-weight: 600;
  }

  &:hover:not(.active) {
    color: $color-fg-primary;
  }
}

.close-icon {
  height: 1.5rem;
  width: 1.5rem;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  > * + * { margin-top: 1.5rem; }
}

.section-title {
  font-size: $font-size-xs;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-fg-secondary;
  font-weight: bold;
  margin-bottom: 1rem;
  border-bottom: 1px solid $color-border-main;
  padding-bottom: 0.5rem;
}

.events-list {
  position: relative;
  border-left: 2px solid $color-border-main;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  position: relative;
}

.person-row {
  cursor: pointer;
  &:hover .event-title {
    color: $color-fg-accent;
  }
}

.timeline-dot {
  position: absolute;
  left: -23px;
  top: 0.25rem;
  height: 0.75rem;
  width: 0.75rem;
  border-radius: 9999px;
}

.event-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.event-year {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-fg-primary;
}

.event-title {
  color: $color-fg-primary;
  font-size: $font-size-base;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.15s;
}

.event-age {
  font-size: $font-size-xs;
  color: $color-fg-secondary;
  margin-top: 0.1rem;
}

.event-desc {
  color: $color-fg-secondary;
  font-size: $font-size-sm;
  margin-top: 0.25rem;
  white-space: pre-wrap;
}

.parent-label {
  color: $color-fg-accent;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}

.age-badge {
  font-size: $font-size-xs;
  color: $color-fg-secondary;
  font-weight: 400;
  margin-left: 0.4rem;
}

.empty-state {
  color: $color-fg-secondary;
  font-size: $font-size-sm;
  text-align: center;
  padding: 2rem 0;
}
</style>
