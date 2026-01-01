<script setup lang="ts">
import TimelineContainer from './components/TimelineContainer.vue';
import SidePanel from './components/SidePanel.vue';
import SearchBox from './components/SearchBox.vue';
import InfoDialog from './components/InfoDialog.vue';
import { useTimelineStore } from './stores/timeline';
import { ref, onMounted } from 'vue';

const store = useTimelineStore();
const showInfo = ref(false);

onMounted(() => {
    // Show info dialog on first visit
    const infoSeen = localStorage.getItem('timeline_info_seen');
    if (!infoSeen) {
        showInfo.value = true;
    }
});

function closeInfo() {
    showInfo.value = false;
    localStorage.setItem('timeline_info_seen', 'true');
}
</script>

<template>
  <div class="app-container ancient-paper">
    <header class="app-header linen-texture">
      
      <div class="header-search">
        <SearchBox />
      </div>

      <div class="header-controls">
        <button 
          class="icon-btn"
          @click="showInfo = true"
          title="Timeline Info"
        >
          <Info class="icon" />
        </button>

        <button 
          class="icon-btn"
          @click="store.setScale(store.scale / 1.2)"
          title="Zoom Out"
        >
          <Minus class="icon" />
        </button>
        <span class="zoom-level">{{ Math.round((store.scale / 5) * 100) }}%</span>
        <button 
          class="icon-btn"
          @click="store.setScale(store.scale * 1.2)"
          title="Zoom In"
        >
          <Plus class="icon" />
        </button>
      </div>
    </header>
    
    <main class="app-main">
      <TimelineContainer />
      <SidePanel />
    </main>

    <InfoDialog :isOpen="showInfo" @close="closeInfo" />
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables' as *;

.app-container {
  height: 100vh;
  width: 100vw;
  color: $color-fg-primary;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: $header-height;
  background-color: rgba($color-bg-secondary, 0.4); 
  border-bottom: 1px solid $color-border-main;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  flex-shrink: 0;
  z-index: 20;
  gap: 1rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

  .header-search {
    flex: 1;
    display: flex;
    justify-content: flex-start;
  }

  .header-controls {
    display: flex;
    align-items: center;
    gap: 0rem; // Modified by user previously
    font-size: $font-size-sm;

    // Small gap between the info button group and zoom group if needed, 
    // or just let them sit together. 
    // Adding a margin to the info button to separate it slightly from zoom controls
    .icon-btn:first-child {
        margin-right: 1rem;
    }
  }
}

.zoom-level {
  width: 4rem;
  text-align: center;
  color: $color-fg-secondary;
}

.icon {
    width: 1.25rem; 
    height: 1.25rem;
}

.app-main {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style>
