<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTimelineStore } from '../stores/timeline';
import { storeToRefs } from 'pinia';
import { useMouseInElement } from '@vueuse/core';
import TimelineEntity from './TimelineEntity.vue';
import TimelineRuler from './TimelineRuler.vue';
import { watch } from 'vue';
import { yearToPx, pxToYear, countYears, displayYear, formatYearLabel } from '../utils/time';

const store = useTimelineStore();
const { scale, totalWidth, layoutRows } = storeToRefs(store);

const container = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const mouseMoved = ref(false);
const startX = ref(0);
const scrollLeftStart = ref(0);

// Vertical scroll/height tracked for the indicator span — horizontal is handled naturally
// by the line living inside .timeline-content
const containerScrollTop = ref(0);
const containerClientHeight = ref(0);

useMouseInElement(container);

function onMouseDown(e: MouseEvent) {
  if (!container.value) return;
  isDragging.value = true;
  mouseMoved.value = false;
  startX.value = e.pageX;
  scrollLeftStart.value = container.value.scrollLeft;
  document.body.style.cursor = 'grabbing';
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || !container.value) return;
  e.preventDefault();
  const walk = (e.pageX - startX.value);
  if (Math.abs(walk) > 3) mouseMoved.value = true;
  container.value.scrollLeft = scrollLeftStart.value - walk;
}

function onMouseUp() {
  isDragging.value = false;
  document.body.style.cursor = 'default';
}

function onWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    const zoomFactor = -e.deltaY * 0.001;
    const newScale = scale.value * (1 + zoomFactor);
    store.setScale(newScale);
  }
}

function onContentClick(e: MouseEvent) {
  if (mouseMoved.value) return;
  const year = pxToYear(e.offsetX, scale.value, store.startDate);
  store.setSelectedYear(year);
  store.selectEntity(null);
}

// The line sits inside .timeline-content so horizontal scroll is instant (no JS needed).
// We only track vertical scroll to keep the line's top/height matching the visible area.
const yearLinePx = computed(() => yearToPx(store.selectedYear ?? 0, scale.value, store.startDate));

const yearIndicatorStyle = computed(() => ({
  left: `${yearLinePx.value}px`,
  top: `${containerScrollTop.value}px`,
  height: `${containerClientHeight.value}px`,
}));

function onContainerScroll() {
  if (!container.value) return;
  containerScrollTop.value = container.value.scrollTop;
}

// Keyboard: left/right nudges selectedYear by 1
function onKeyDown(e: KeyboardEvent) {
  if (store.selectedYear === null) return;
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  e.preventDefault();
  const continuous = countYears(store.selectedYear);
  const next = e.key === 'ArrowLeft' ? continuous - 1 : continuous + 1;
  store.setSelectedYear(displayYear(next));
}

// Navigation Logic
watch(() => store.navigationTarget, (target) => {
  if (target && container.value) {
     const px = yearToPx(target.year, scale.value, store.startDate);
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
  window.addEventListener('keydown', onKeyDown);
  if (container.value) {
    containerClientHeight.value = container.value.clientHeight;
    container.value.addEventListener('scroll', onContainerScroll);
  }
});

onUnmounted(() => {
  window.removeEventListener('mouseup', onMouseUp);
  window.removeEventListener('keydown', onKeyDown);
  container.value?.removeEventListener('scroll', onContainerScroll);
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
      @click="onContentClick"
    >

      <!-- Ruler -->
      <TimelineRuler />

      <!-- Year indicator: lives inside content so horizontal scroll is lag-free -->
      <div
        v-if="store.selectedYear !== null"
        class="year-indicator"
        :style="yearIndicatorStyle"
      >
        <span class="year-indicator-label">{{ formatYearLabel(store.selectedYear, true) }}</span>
      </div>

      <!-- Entities -->
      <div class="entities-layer">
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
  padding-top: 3rem;
  padding-bottom: 5rem;
  pointer-events: auto;
}

.year-indicator {
  position: absolute;
  width: 1px;
  background-color: #ef4444;
  pointer-events: none;
  z-index: 5;
}

.year-indicator-label {
  position: absolute;
  top: 2rem; // just below the ruler
  left: 3px;
  background-color: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 600;
  padding: 1px 5px;
  white-space: nowrap;
  line-height: 1.6;
  border-radius: 2px;
}
</style>
