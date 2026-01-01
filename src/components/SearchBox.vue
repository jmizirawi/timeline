<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import { storeToRefs } from 'pinia';
import { formatYearLabel } from '../utils/time';

const store = useTimelineStore();
const { people, events } = storeToRefs(store);

const query = ref('');
const showSuggestions = ref(false);

interface Suggestion {
  type: 'person' | 'event' | 'date';
  id?: string;
  name: string;
  year: number;
  data?: any;
}

const suggestions = computed(() => {
  if (query.value.length < 2) return [];

  const raw = query.value.trim().toLowerCase();
  const results: Suggestion[] = [];

  // Check if it looks like a year
  // Check if it looks like a year
  const potentialYear = parseInt(raw);
  
  if (!isNaN(potentialYear) && Math.abs(potentialYear) < 10000) {
      const isExplicitBCE = raw.includes('bce') || raw.includes('bc');
      const isExplicitCE = raw.includes('ce') && !isExplicitBCE; // simple check
      const isNegative = potentialYear < 0;

      if (isExplicitBCE || isNegative) {
          // Explicit BCE
          const y = -Math.abs(potentialYear);
          results.push({
              type: 'date',
              name: `Jump to ${Math.abs(y)} BCE`,
              year: y
          });
      } else if (isExplicitCE) {
          // Explicit CE
          const y = Math.abs(potentialYear);
          results.push({
              type: 'date',
              name: `Jump to ${y} CE`,
              year: y
          });
      } else {
        // Ambiguous - Suggest Both
        const yCE = Math.abs(potentialYear);
        const yBCE = -Math.abs(potentialYear);

        // CE suggestion
        if (yCE !== 0) {
            results.push({
                type: 'date',
                name: `Jump to ${yCE} CE`,
                year: yCE
            });
        }
        
        // BCE suggestion
        if (yBCE !== 0) {
            results.push({
                type: 'date',
                name: `Jump to ${Math.abs(yBCE)} BCE`,
                year: yBCE
            });
        }
      }
  }

  // Filter People
  people.value.forEach(p => {
    if (p.name.toLowerCase().includes(raw)) {
      results.push({
        type: 'person',
        id: p.id,
        name: p.name,
        year: p.born,
        data: p
      });
    }
  });

  // Filter Events
  events.value.forEach(e => {
    if (e.title.toLowerCase().includes(raw)) {
      results.push({
        type: 'event',
        id: e.id,
        name: e.title,
        year: e.startDate,
        data: e
      });
    }
  });

  return results.slice(0, 10);
});

function onSelect(s: Suggestion) {
  if (s.type === 'date') {
    store.jumpToDate(s.year);
  } else if (s.id) {
    store.jumpToEntity(s.id);
  }
  query.value = '';
  showSuggestions.value = false;
}

function onBlur() {
    // Delay hide to allow click
    setTimeout(() => {
        showSuggestions.value = false;
    }, 200);
}
</script>

<template>
  <div class="search-container">
    <div class="relative">
      <input 
        v-model="query"
        type="text" 
        placeholder="Search for people, events, or dates" 
        class="search-input"
        @focus="showSuggestions = true"
        @blur="onBlur"
      >
      <div 
        v-if="query" 
        class="clear-btn"
        @click="query = ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div v-else class="search-icon-wrapper">
         <svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
         </svg>
      </div>
    </div>

    <!-- Suggestions Dropdown -->
    <div 
      v-if="showSuggestions && suggestions.length > 0" 
      class="search-dropdown"
    >
      <ul>
        <li 
          v-for="(s, idx) in suggestions" 
          :key="idx"
          class="dropdown-item"
          @mousedown="onSelect(s)"
        >
          <div>
            <span class="item-name">{{ s.name }}</span>
            <span class="item-year" v-if="s.type !== 'date'">{{ formatYearLabel(s.year) }}</span>
          </div>
          <span 
            class="type-chip"
            :class="`type-${s.type}`"
          >
            {{ s.type }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.search-container {
  position: relative;
  width: 100%;
  max-width: 20rem;
}

.search-input {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  font-size: $font-size-sm;
  font-family: inherit;
  color: $color-fg-primary;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  
  &::placeholder {
    color: $color-fg-secondary;
  }

  &:focus {
    outline: none;
    background-color: rgba(0, 0, 0, 0.2);
    // Remove focus ring preference for "part of header" look?
    // Or keep a subtle one?
    // User asked for "inset". Usually no ring, just darker bg.
  }
}

.clear-btn {
  position: absolute;
  right: 0.75rem; // right-3
  top: 50%;
  transform: translateY(-50%);
  color: $color-fg-secondary; // was 400
  cursor: pointer;
  
  &:hover {
    color: $color-fg-primary; // was 600
  }
}

.search-icon-wrapper {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: $color-fg-secondary; // was 400
  pointer-events: none;
}

.icon {
  height: 1rem; 
  width: 1rem;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem; // mt-2
  background-color: $color-bg-primary;
  border: 1px solid $color-border-main;
  border-radius: 0.5rem; // rounded-lg
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  padding: 0.5rem 1rem; // px-4 py-2
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba($color-border-main, 0.3);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba($color-bg-secondary, 0.5);
  }
}

.item-name {
  color: $color-fg-primary;
  font-size: $font-size-sm;
  font-weight: 500;
}

.item-year {
  margin-left: 0.5rem;
  color: $color-fg-accent;
  font-size: $font-size-xs;
}

.type-chip {
  font-size: $font-size-xxs;
  text-transform: uppercase;
  letter-spacing: 0.05em; // tracking-wider
  font-weight: 700; // font-bold
  padding: 0.125rem 0.375rem; // px-1.5 py-0.5
  border-radius: 0.25rem;
  background-color: $color-bg-secondary;
  color: $color-fg-secondary;
}
</style>
