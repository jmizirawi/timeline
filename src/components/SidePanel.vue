<script setup lang="ts">
import { useTimelineStore } from '../stores/timeline';
import { storeToRefs } from 'pinia';
import { formatDateWithCertainty } from '../utils/time';
import { getCategoryColor } from '../utils/colors';
import type { Person, TimelineEvent } from '../types';


const store = useTimelineStore();
const { selectedEntity } = storeToRefs(store);

function close() {
  store.selectEntity(null);
}

function isPerson(entity: any): entity is Person {
  return 'born' in entity;
}

function isGlobalEvent(entity: any): entity is TimelineEvent {
  return 'startDate' in entity;
}

function getDotStyle(entity: any) {
    return { backgroundColor: getCategoryColor(entity) };
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
    <div v-if="selectedEntity" class="side-panel linen-texture">
      <!-- Header -->
      <div class="panel-header">
        <div>
          <h2 class="panel-title">
            {{ isPerson(selectedEntity) ? selectedEntity.name : selectedEntity.title }}
            <Check v-if="selectedEntity.verified" class="verified-icon-lg" />
          </h2>
          <p class="panel-dates">
            <span v-if="isPerson(selectedEntity)">
              {{ formatDateWithCertainty(selectedEntity.born, selectedEntity.bornCertainty) }}
              <span v-if="selectedEntity.died !== undefined">
                  – {{ formatDateWithCertainty(selectedEntity.died, selectedEntity.diedCertainty) }}
              </span>
              <span v-else-if="selectedEntity.living">
                  – Present
              </span>
            </span>
            <span v-else>
               {{ formatDateWithCertainty(selectedEntity.startDate, selectedEntity.startDateCertainty) }}
               <span v-if="selectedEntity.endDate !== undefined">
                  – {{ formatDateWithCertainty(selectedEntity.endDate, selectedEntity.endDateCertainty) }}
               </span>
               <span v-else-if="selectedEntity.ongoing">
                 – Present
               </span>
            </span>
          </p>
        </div>
        <button @click="close" class="icon-btn">
          <X class="close-icon" />
        </button>
      </div>

      <!-- Content -->
      <div class="panel-content">

        <img v-if="isPerson(selectedEntity) && selectedEntity.imageUrl" :src="selectedEntity.imageUrl" class="person-image" />
        <img v-if="isGlobalEvent(selectedEntity) && selectedEntity.imageUrl" :src="selectedEntity.imageUrl" class="event-image" />

        <p class="entity-desc" v-if="isPerson(selectedEntity) && selectedEntity.description">{{ selectedEntity.description }}
          <a v-if="selectedEntity.url" :href="selectedEntity.url" target="_blank" class="ref-link" title="Read Reference">
            <Link class="ref-icon" />
          </a>
        </p>

        <!-- Life Events for Person -->
        <div v-if="isPerson(selectedEntity)">
           <h3 class="section-title">Life Events</h3>
           <div class="events-list">
              <div v-for="(event, idx) in selectedEntity.lifeEvents" :key="idx" class="event-item">
                <div class="timeline-dot" :style="getDotStyle(selectedEntity)"></div>
                <div>
                  <div class="event-header" v-if="event.startDate !== undefined">
                    <h4 class="event-year">{{ formatDateWithCertainty(event.startDate, event.startDateCertainty) }}</h4>
                    <span class="event-age" v-if="event.startDate - selectedEntity.born >= 0">Age {{ event.startDate - selectedEntity.born }}</span>
                  </div>
                  <p class="event-title">
                    {{ event.title }}
                    <a v-if="event.url" :href="event.url" target="_blank" class="ref-link" title="Read Reference">
                      <Link class="ref-icon" />
                    </a>
                  </p>
                  <img v-if="event.imageUrl" :src="event.imageUrl" class="subevent-image" alt="Event Image" />
                  <p v-if="event.description" class="event-desc">{{ event.description }}</p>
                  <p v-if="event.location" class="event-location">
                    <MapPin class="location-icon" />
                    {{ event.location }}
                  </p>
                </div>
              </div>
           </div>
        </div>
        
        <!-- Description for Global Event -->
        <div v-else>
           <p class="entity-desc" v-if="selectedEntity.description">{{ selectedEntity.description }}</p>
           
           <!-- Sub Events -->
           <div v-if="selectedEntity.subEvents && selectedEntity.subEvents.length > 0" class="sub-events-section">
               <h3 class="section-title">Events</h3>
               <div class="events-list">
                  <div v-for="(event, idx) in selectedEntity.subEvents" :key="idx" class="event-item">
                    <div class="timeline-dot sub-dot" :style="getDotStyle(selectedEntity)"></div>
                    <div>
                      <div class="event-header" v-if="event.startDate !== undefined">
                        <h4 class="event-year">{{ formatDateWithCertainty(event.startDate, event.startDateCertainty) }}</h4>
                        <span class="event-age" v-if="event.startDate - selectedEntity.startDate >= 0">+{{ event.startDate - selectedEntity.startDate }} yrs</span>
                      </div>
                      <p class="event-title">
                        {{ event.title }}
                        <a v-if="event.url" :href="event.url" target="_blank" class="ref-link" title="Read Reference">
                          <Link class="ref-icon" />
                        </a>
                      </p>
                      <img v-if="event.imageUrl" :src="event.imageUrl" class="subevent-image" alt="Event Image" />
                      <p v-if="event.description" class="event-desc">{{ event.description }}</p>
                      <p v-if="event.location" class="event-location">
                        <MapPin class="location-icon" />
                        {{ event.location }}
                      </p>
                    </div>
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

.panel-title {
  font-size: $font-size-2xl;
  font-weight: bold;
  color: $color-fg-primary;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verified-icon-lg {
  color: $color-fg-secondary;
  height: $font-size-base;
}

.ref-link {
  color: $color-fg-secondary;
  transition: color 0.15s;
  &:hover { color: $color-fg-accent; }
}

.ref-icon {
  height: $font-size-base;
}

.panel-dates {
  color: $color-fg-accent;
  font-size: $font-size-sm;
}


.close-icon {
  height: 1.5rem; // w-6 h-6
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
  gap: 1.5rem;
}

.event-item {
  position: relative;
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
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.event-year {
  font-size: $font-size-sm;
  font-weight: 600;
  color: $color-fg-primary;
}

.event-age {
  font-size: $font-size-xs;
  color: $color-fg-secondary;
}

.event-title {
  color: $color-fg-primary;
  font-size: $font-size-base;
  line-height: 1.625;
  font-weight: 500;
}

.event-desc {
  color: $color-fg-secondary;
  font-size: $font-size-sm;
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
  white-space: pre-wrap;
}

.event-location {
  margin-top: 0.5rem;
  font-size: $font-size-xs;
  color: $color-fg-accent;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.location-icon {
  width: 0.75rem;
  height: 0.75rem;
}

.entity-desc {
  color: $color-fg-secondary;
  white-space: pre-wrap;
  font-size: $font-size-sm;
  margin-top: 0;
}

.sub-events-section {
  margin-top: 1.5rem;
}

.person-image {
  width: 33%;
  height: auto;
  margin: 0 0 1rem 1rem;
  float: right;
  object-fit: cover;
  -webkit-mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  filter: sepia(0.8) grayscale(0.2);
}

.event-image {
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: block;
  -webkit-mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  filter: sepia(0.8) grayscale(0.2);
}

.subevent-image {
  width: 100%;
  height: auto;
  border-radius: 0.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  display: block;
  -webkit-mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  mask-image: radial-gradient(ellipse at center, black 5%, transparent 80%);
  filter: sepia(0.8) grayscale(0.2);
}
</style>
