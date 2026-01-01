<script setup lang="ts">
import { computed } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import { yearToPx, formatYearLabel } from '../utils/time';

const store = useTimelineStore();

const ticks = computed(() => {
  const t: { year: number; left: number; label: string; isMajor: boolean }[] = [];
  const start = -4100;
  const end = 2026;
  
  // We want to show a point for EVERY year.
  // However, we still need to know which ones are "major" to show labels.
  
  // Logic for major interval (labels):
  // We want to ensure labels don't collide. Let's say a label needs about 60px width.
  const MIN_LABEL_WIDTH = 60;
  const minYearInterval = MIN_LABEL_WIDTH / store.scale;
  
  // Find the smallest "nice" interval that fits
  const NICE_INTERVALS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000];
  const labelInterval = NICE_INTERVALS.find(i => i >= minYearInterval) || 5000;

  for (let y = start; y <= end; y++) {
    if (y === 0) continue;

    // It is a major tick if it divides by labelInterval OR if it is year 1
    const isMajor = (y % labelInterval === 0) || (y === 1);
    
    // Optimization: If scale is very small (e.g. < 0.1), showing 1px lines for every year 
    // means they overlap and look like a solid block.
    // If scale < 0.5 (1px = 2 years), maybe we skip odd years?
    // The user asked for "every year", so strict adherence means we render them.
    // But let's try to be smart: if pixels per year < 1, we can't physically distinct them easily.
    // If store.scale < 0.5, we might skip rendering minor ticks to avoid solid black bar.
    if (!isMajor && store.scale < 0.2) {
       continue; 
    }

    t.push({
      year: y,
      left: yearToPx(y, store.scale, store.startDate),
      label: isMajor ? formatYearLabel(y) : '',
      isMajor
    });
  }
  return t;
});
</script>

<template>
  <div class="timeline-ruler">
    <div 
      v-for="tick in ticks" 
      :key="tick.year"
      class="ruler-tick"
      :class="[
        tick.isMajor ? 'tick-major' : 'tick-minor'
      ]"
      :style="{ left: `${tick.left}px` }"
    >
      <span 
        v-if="tick.isMajor"
        class="tick-label"
      >{{ tick.label }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.timeline-ruler {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 2rem; // h-8
  border-bottom: 1px solid $color-border-main;
  pointer-events: none;
  z-index: 10;
  background-color: rgba($color-bg-secondary, 0.8);
  backdrop-filter: blur(4px);
}

.ruler-tick {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-left: 0.25rem; // pl-1
  padding-bottom: 0.25rem; // pb-1
}

.tick-major {
  height: 100%;
  border-left: 1px solid $color-border-main;
}

// .tick-minor {
//   height: 0.5rem;
//   border-left: 1px solid rgba($color-border-main, 0.2);
//   top: 1.5rem;
// }

.tick-label {
  font-size: $font-size-xxs;
  color: $color-fg-secondary;
  line-height: 1;
}
</style>
