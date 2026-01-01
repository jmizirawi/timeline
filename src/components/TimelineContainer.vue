<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';
import TimelineEntity from './TimelineEntity.vue';
import TimelineRuler from './TimelineRuler.vue';
const store = useTimelineStore();
const { scale, totalWidth, layoutRows } = storeToRefs(store);

const container = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const startX = ref(0);
const scrollLeftStart = ref(0);

useMouseInElement(container);

function onMouseDown(e: MouseEvent) {
  if (!container.value) return;
  isDragging.value = true;
  startX.value = e.pageX;
  scrollLeftStart.value = container.value.scrollLeft;
  document.body.style.cursor = 'grabbing';
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || !container.value) return;
  e.preventDefault();
  const walk = (e.pageX - startX.value); // scroll-fast
  container.value.scrollLeft = scrollLeftStart.value - walk;
}

function onMouseUp() {
  isDragging.value = false;
  document.body.style.cursor = 'default';
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    // Zoom
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    const newScale = scale.value * (1 + zoomFactor);
    store.setScale(newScale);
  }
}

// Navigation Logic
import { watch } from 'vue';
import { yearToPx } from '../utils/time';

watch(() => store.navigationTarget, (target) => {
  if (target && container.value) {
     const px = yearToPx(target.year, scale.value, store.startDate);
     // Center it
     const halfWidth = container.value.clientWidth / 2;
     container.value.scrollTo({
         left: px - halfWidth,
         behavior: 'smooth'
     });
  }
});

onMounted(() => {
  store.loadData();
  window.addEventListener('mouseup', onMouseUp);
});
</script>

<template>
  <div 
    ref="container"
    class="timeline-container custom-scrollbar"
    :class="{ 'cursor-grab': !isDragging, 'cursor-grabbing': isDragging }"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @wheel="onWheel"
  >
    <div 
      class="timeline-content"
      :style="{ width: `${totalWidth}px` }"
    >

      <!-- Ruler -->
      <TimelineRuler />

      <!-- Entities -->
      <div class="entities-layer"> <!-- Padding for ruler and bottom -->
        <div v-for="(row, rIndex) in layoutRows" :key="rIndex">
          <TimelineEntity 
            v-for="entity in row" 
            :key="entity.id" 
            :entity="entity" 
            :row="rIndex" 
          />
        </div>
      </div>
      
    </div>
    

  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.timeline-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  user-select: none;
  position: relative;
  background-color: transparent;
  
  &.cursor-grab { cursor: grab; }
  &.cursor-grabbing { cursor: grabbing; }
}

.timeline-content {
  min-height: 100%;
  position: relative;
  border-left: 1px solid $color-border-main;
}

.entities-layer {
  position: relative;
  padding-top: 3rem; // 12 * 0.25
  padding-bottom: 5rem; // 20 * 0.25
  pointer-events: auto;
}
</style>
