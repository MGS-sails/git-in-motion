<script setup lang="ts">
const concepts = [
  {
    name: "Commit",
    description: "A snapshot of your code at a point in time. Like a save point in a game.",
    color: "var(--color-commit)",
    icon: "circle",
  },
  {
    name: "Branch",
    description: "A movable label pointing to a commit. Create them freely!",
    color: "var(--color-branch)",
    icon: "tag",
  },
  {
    name: "HEAD",
    description: "Your current location in the repository. Where you are right now.",
    color: "var(--color-head)",
    icon: "location",
  },
  {
    name: "Staging",
    description: "Changes ready to be committed. The preparation area.",
    color: "var(--color-staging)",
    icon: "box",
  },
  {
    name: "Merge",
    description: "Combining branches. Creates a commit with two parents.",
    color: "var(--color-merge)",
    icon: "merge",
  },
];
</script>

<template>
  <div class="legend glass-card">
    <div class="legend__header">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
      <h3 class="legend__title">Concept Guide</h3>
    </div>

    <div class="legend__grid">
      <div
        v-for="concept in concepts"
        :key="concept.name"
        class="concept"
      >
        <div class="concept__icon" :style="{ background: concept.color }">
          <!-- Commit icon -->
          <svg v-if="concept.icon === 'circle'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8"/>
          </svg>

          <!-- Branch/tag icon -->
          <svg v-else-if="concept.icon === 'tag'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>

          <!-- HEAD/location icon -->
          <svg v-else-if="concept.icon === 'location'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="10" r="3"/>
            <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/>
          </svg>

          <!-- Staging/box icon -->
          <svg v-else-if="concept.icon === 'box'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>

          <!-- Merge icon -->
          <svg v-else-if="concept.icon === 'merge'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="18" cy="18" r="3"/>
            <circle cx="6" cy="6" r="3"/>
            <path d="M6 21V9a9 9 0 0 0 9 9"/>
          </svg>
        </div>

        <div class="concept__content">
          <div class="concept__name" :style="{ color: concept.color }">
            {{ concept.name }}
          </div>
          <div class="concept__description">
            {{ concept.description }}
          </div>
        </div>
      </div>
    </div>

    <div class="legend__tip">
      <span class="tip-icon">💡</span>
      <span class="tip-text">The graph above shows these concepts in action as you run commands!</span>
    </div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.legend__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.legend__header svg {
  color: var(--text-muted);
}

.legend__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.legend__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.concept {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.concept:hover {
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.concept__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: white;
  flex-shrink: 0;
}

.concept__content {
  flex: 1;
  min-width: 0;
}

.concept__name {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.concept__description {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
}

.legend__tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(251, 191, 36, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.tip-icon {
  font-size: 1rem;
}

.tip-text {
  line-height: 1.4;
}
</style>
