<script setup lang="ts">
import { computed } from 'vue';
import type { Person, TimelineEvent } from '../types';
import { useTimelineStore } from '../stores/timeline';
import { yearToPx, formatDateWithCertainty } from '../utils/time';
import { getCategoryColor } from '../utils/colors';


const props = defineProps<{
  entity: Person | TimelineEvent;
  row: number;
}>();

const store = useTimelineStore();

const isPerson = (e: Person | TimelineEvent): e is Person => 'born' in e;

const startDate = computed(() => isPerson(props.entity) ? props.entity.born : props.entity.startDate);
const endDate = computed(() => {
  if (isPerson(props.entity)) {
    if (props.entity.living) return new Date().getFullYear();
    return props.entity.died ?? props.entity.born;
  } else {
    if (props.entity.ongoing) return new Date().getFullYear();
    return props.entity.endDate ?? props.entity.startDate;
  }
});
const startCertainty = computed(() => isPerson(props.entity) ? props.entity.bornCertainty : props.entity.startDateCertainty);
const endCertainty = computed(() => isPerson(props.entity) ? props.entity.diedCertainty : props.entity.endDateCertainty);
const label = computed(() => isPerson(props.entity) ? props.entity.name : props.entity.title);

const formattedEndYear = computed(() => {
  if ((isPerson(props.entity) && props.entity.living) || (!isPerson(props.entity) && props.entity.ongoing)) {
    return 'Present';
  }
  return formatDateWithCertainty(endDate.value, endCertainty.value);
});

const style = computed(() => {
  const left = yearToPx(startDate.value, store.scale, store.startDate);
  const width = yearToPx(endDate.value, store.scale, startDate.value);
  
  // Dynamic height configuration
  const rowHeight = 48;
  const top = props.row * rowHeight + 40; // +40 padding from top

  return {
    left: `${left}px`,
    width: `${Math.max(width, 20)}px`, // Min width visibility
    top: `${top}px`,
  };
});

const maskStyle = computed(() => {
  const isStartGuess = startCertainty.value === 'guess';
  const isEndGuess = endCertainty.value === 'guess';

  if (isStartGuess && isEndGuess) {
      return { maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)', webkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)' };
  }
  if (isStartGuess) {
      return { maskImage: 'linear-gradient(to right, transparent, black 16px)', webkitMaskImage: 'linear-gradient(to right, transparent, black 16px)' };
  }
  if (isEndGuess) {
      return { maskImage: 'linear-gradient(to left, transparent, black 16px)', webkitMaskImage: 'linear-gradient(to left, transparent, black 16px)' };
  }
  return {};
});

// const age = computed(() => endDate.value - startDate.value);

const colorStyle = computed(() => {
  const bgColor = getCategoryColor(props.entity);
  return {
    backgroundColor: bgColor,
  };
});

function onClick() {
  store.selectEntity(props.entity);
}

// Milestone positioning
const milestones = computed(() => {
  let events: any[] = [];
  let startDate = 0;

  if (isPerson(props.entity)) {
      events = props.entity.lifeEvents;
      startDate = props.entity.born;
  } else {
      events = props.entity.subEvents || [];
      startDate = props.entity.startDate;
  }

  return events
    .filter(e => e.startDate !== undefined)
    .map(e => {
    // Relative distance calculation
    const px = yearToPx(e.startDate!, store.scale, startDate);
    return { ...e, left: px };
  });
});
const isHighlighted = computed(() => store.highlightedId === props.entity.id);
</script>

<template>
  <div
    class="entity-wrapper group"
    :class="{ 'is-highlighted': isHighlighted }"
    :style="style"
    @click.stop="onClick"
  >
    <!-- Background Bar (Masked & Colored) -->
    <div 
      class="entity-bar"
      :style="[maskStyle, colorStyle]"
      :title="`${label} (${formatDateWithCertainty(startDate, startCertainty)} - ${formattedEndYear})`"
    ></div>

    <!-- Text Label (Unmasked, can overflow) -->
    <div class="entity-label-container">
      <span class="entity-label">
        {{ label }}
        <Check v-if="entity.verified" class="verified-icon" />
      </span>
    </div>

    <!-- Milestones -->
    <!-- Positioned relative to wrapper, so they fall on the correct year -->
     <div 
        v-for="(m, idx) in milestones" 
        :key="idx" 
        class="milestone-dot"
        :style="{ left: `${m.left}px` }"
        :title="`${m.title}${m.description ? ' - ' + m.description : ''}`"
      ></div>

    <!-- Hover tooltip detail (Unmasked) -->
    <!-- <div class="entity-tooltip">
      {{ label }} ({{ age }} yrs)
    </div> -->
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.entity-wrapper {
  position: absolute;
  height: 2rem; // h-8
  cursor: pointer;
  
  // Transition
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  
  // Z-index management
  z-index: 1;

  // Hover state for wrapper
  &:hover {
    
    .entity-bar {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
  }

  // Highlight state (Unmasked shadow)
  &.is-highlighted {
    transform: translateY(-2px);
    
    .entity-bar {
      border: 4px solid $color-border-highlight;
      box-shadow: 0px 8px 16px -8px rgba(0, 0, 0, 0.7), 0px 1px 0px rgba(0, 0, 0, 0.1);
    }
  }
}

.entity-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  
  // Base Shadow
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  
  // Backdrop blur
  backdrop-filter: blur(4px);
}

.entity-label-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 0.5rem;
  white-space: nowrap;
  pointer-events: none;
  z-index: 2; 
}

.entity-label {
  font-weight: 600;
  font-size: $font-size-xs;
  color: $color-white; 
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.verified-icon {
  color: $color-fg-secondary;
  width: $font-size-sm;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
}

.milestone-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0.375rem; 
  height: 0.375rem;
  background-color: $color-white;
  border-radius: 9999px;
  opacity: 0.2;
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: all 0.15s;
  z-index: 5; // Above bar

  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.5);
  }
}

// .entity-tooltip {
//   display: none; // Hidden by default
//   position: absolute;
//   top: -2rem; // -top-8 approx
//   left: 0;
//   background-color: $color-bg-primary;
//   border: 1px solid $color-border-main;
//   padding: 0.25rem 0.5rem;
//   border-radius: 0.25rem;
//   color: $color-fg-primary;
//   z-index: 20;
//   white-space: nowrap;
//   pointer-events: none;
//   box-shadow: 0 0 0 1px rgba(28, 25, 23, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
// }
</style>
