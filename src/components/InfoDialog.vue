<script setup lang="ts">
import { getCategoryColor } from '../utils/colors';


defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// Sample data for legend to use the actual color utility
const categories = [
    { label: 'Biblical', description: 'People and events mentioned in the Bible', type: 'biblical' },
    { label: 'Secular', description: 'People and events from secular history', type: 'secular' },
    { label: 'Theocratic', description: 'Modern theocratic history of Jehovah\'s Witnesses', type: 'theocratic' }
];

function getColor(type: string) {
    // Mock entity to get color
    return getCategoryColor({ category: type } as any);
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-container ancient-paper">
        
        <div class="modal-header">
            <h2 class="modal-title">Timeline Guide</h2>
            <button class="icon-btn" @click="emit('close')">
                <X class="close-icon" />
            </button>
        </div>

        <div class="modal-content custom-scrollbar">
            
            <!-- Color Legend -->
            <section class="info-section">
                <h3 class="section-title">Categories</h3>
                <ul class="legend-list">
                    <li v-for="cat in categories" :key="cat.type" class="legend-item">
                        <div class="color-dot" :style="{ backgroundColor: getColor(cat.type) }"></div>
                        <div>
                            <span class="legend-label">{{ cat.label }}</span>
                            <p class="legend-desc">{{ cat.description }}</p>
                        </div>
                    </li>
                </ul>
            </section>

            <!-- Symbols -->
            <section class="info-section">
                <h3 class="section-title">Symbols</h3>
                <ul class="info-list">
                    <li class="info-item">
                        <span class="symbol">
                            <Check class="ref-icon-sm" />
                        </span>
                        <span><strong>Verified</strong>; entity has been thoroughly researched, dates verified, and references added.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">
                            <Link class="ref-icon-sm" />
                        </span>
                        <span><strong>Link</strong> to a citation or reference.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">~</span>
                        <span><strong>Guess</strong>; exact date is unknown.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">a.</span>
                        <span><strong>After</strong>; the event occurred after this date.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">b.</span>
                        <span><strong>Before</strong>; the event occurred before this date.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">c.</span>
                        <span><strong>Circa</strong>; the event occurred around this date.</span>
                    </li>
                    <li class="info-item">
                        <span class="symbol">
                            <div class="entity-bar" style="mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent); background-color: rgba(186, 97, 94, 0.7);"></div>
                        </span>
                        <span><strong>Faded bars</strong> indicate approximate dates; the exact date is unknown or uncertain.</span>
                    </li>
                </ul>
            </section>

            <!-- Conventions -->
            <section class="info-section">
                <h3 class="section-title">Conventions & Assumptions</h3>
                <ul class="info-list">
                    <li class="info-item">
                        <span class="bullet">•</span>
                        <span>If a person's lifespan is unknown, a <strong>100-year lifespan</strong> is assumed with an indication that the birth and death date are a guess.</span>
                    </li>
                    <li class="info-item">
                        <span class="bullet">•</span>
                        <span>If we know when a prophet began prophesying, but we're not sure how old they were at that time, we assume they started prophesying at <strong>30 years old</strong>.</span>
                    </li>
                </ul>
            </section>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba($color-black, 0.6);
    backdrop-filter: blur(2px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-container {
    width: 100%;
    max-width: 32rem; // max-w-lg
    max-height: 80vh;
    background-color: $color-bg-primary;
    border: 1px solid $color-border-main;
    border-radius: 0.75rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.modal-header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid $color-border-main;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: rgba($color-bg-secondary, 0.3);
}

.modal-title {
    font-size: $font-size-xl;
    font-weight: bold;
    color: $color-fg-primary;
}

.close-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.ref-icon-sm {
    width: 1rem;
    height: 1rem;
}

.modal-content {
    padding: 1.5rem;
    overflow-y: auto;
    color: $color-fg-secondary;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.section-title {
    font-size: $font-size-sm;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $color-fg-accent;
    font-weight: bold;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba($color-border-main, 0.5);
    padding-bottom: 0.5rem;
}

.legend-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    list-style: none;
}

.legend-item {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
}

.color-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 0.25rem;
}

.legend-label {
    font-weight: bold;
    color: $color-fg-primary;
    display: block;
    margin-bottom: 0.125rem;
}

.legend-desc {
    font-size: $font-size-sm;
    line-height: 1.4;
}

.info-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    font-size: $font-size-sm;
    line-height: 1.5;
}

.symbol, .bullet {
    flex-shrink: 0;
    font-weight: bold;
    min-width: 32px;
    text-align: center;
    color: $color-fg-primary;
}

.faded-example {
    opacity: 0.5;
}


// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.entity-bar {
    width: 32px;
    height: 21px;
}
</style>
