<script setup lang="ts">
import { computed } from "vue";
import type { Tutorial } from "../engine/tutorialTypes";
import { getTutorialsByMode } from "../engine/tutorials";

const props = defineProps<{ mode?: "basic" | "advanced" }>();

const emit = defineEmits<{
  select: [tutorial: Tutorial];
  close: [];
}>();

const visibleTutorials = computed(() =>
  getTutorialsByMode(props.mode ?? "basic")
);

const beginnerTutorials = computed(() =>
  visibleTutorials.value.filter(t => t.difficulty === "beginner")
);

const intermediateTutorials = computed(() =>
  visibleTutorials.value.filter(t => t.difficulty === "intermediate")
);

const advancedTutorials = computed(() =>
  visibleTutorials.value.filter(t => t.difficulty === "advanced")
);

function selectTutorial(tutorial: Tutorial) {
  emit("select", tutorial);
}
</script>

<template>
  <div class="tutorial-selector glass-card">
    <div class="selector-header">
      <div>
        <h2 class="selector-title">🎓 Learn Git Interactively</h2>
        <p class="selector-subtitle">Choose a tutorial to get started</p>
      </div>
      <button @click="$emit('close')" class="btn-close-selector" title="Close">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div class="tutorials-grid">
      <!-- Beginner Section -->
      <div v-if="beginnerTutorials.length" class="tutorial-section">
        <h3 class="section-title">
          <span class="section-icon">🌱</span>
          Beginner
        </h3>
        <div class="tutorial-cards">
          <div
            v-for="tutorial in beginnerTutorials"
            :key="tutorial.id"
            @click="selectTutorial(tutorial)"
            class="tutorial-card tutorial-card--beginner"
          >
            <div class="card-header">
              <span class="card-icon">{{ tutorial.icon }}</span>
              <span class="card-badge difficulty-beginner">Beginner</span>
            </div>
            <h4 class="card-title">{{ tutorial.title }}</h4>
            <p class="card-description">{{ tutorial.description }}</p>
            <div class="card-footer">
              <span class="card-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {{ tutorial.estimatedTime }}
              </span>
              <span class="card-steps">{{ tutorial.steps.length }} steps</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Intermediate Section -->
      <div v-if="intermediateTutorials.length" class="tutorial-section">
        <h3 class="section-title">
          <span class="section-icon">🚀</span>
          Intermediate
        </h3>
        <div class="tutorial-cards">
          <div
            v-for="tutorial in intermediateTutorials"
            :key="tutorial.id"
            @click="selectTutorial(tutorial)"
            class="tutorial-card tutorial-card--intermediate"
          >
            <div class="card-header">
              <span class="card-icon">{{ tutorial.icon }}</span>
              <span class="card-badge difficulty-intermediate">Intermediate</span>
            </div>
            <h4 class="card-title">{{ tutorial.title }}</h4>
            <p class="card-description">{{ tutorial.description }}</p>
            <div class="card-footer">
              <span class="card-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {{ tutorial.estimatedTime }}
              </span>
              <span class="card-steps">{{ tutorial.steps.length }} steps</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Section -->
      <div v-if="advancedTutorials.length" class="tutorial-section">
        <h3 class="section-title">
          <span class="section-icon">🔥</span>
          Advanced
        </h3>
        <div class="tutorial-cards">
          <div
            v-for="tutorial in advancedTutorials"
            :key="tutorial.id"
            @click="selectTutorial(tutorial)"
            class="tutorial-card tutorial-card--advanced"
          >
            <div class="card-header">
              <span class="card-icon">{{ tutorial.icon }}</span>
              <span class="card-badge difficulty-advanced">Advanced</span>
            </div>
            <h4 class="card-title">{{ tutorial.title }}</h4>
            <p class="card-description">{{ tutorial.description }}</p>
            <div class="card-footer">
              <span class="card-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                {{ tutorial.estimatedTime }}
              </span>
              <span class="card-steps">{{ tutorial.steps.length }} steps</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tutorial-selector {
  padding: 0;
  overflow: hidden;
  animation: fadeInUp 0.4s ease-out;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}

.selector-title {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.selector-subtitle {
  margin: 0.5rem 0 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn-close-selector {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close-selector:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-commit);
  color: var(--text-primary);
}

.tutorials-grid {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-height: 600px;
  overflow-y: auto;
}

.tutorial-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-icon {
  font-size: 1.2rem;
}

.tutorial-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.tutorial-card {
  padding: 1.25rem;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tutorial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

.tutorial-card--beginner:hover {
  border-color: var(--color-branch);
  box-shadow: 0 8px 30px rgba(52, 211, 153, 0.2);
}

.tutorial-card--intermediate:hover {
  border-color: var(--color-head);
  box-shadow: 0 8px 30px rgba(251, 191, 36, 0.2);
}

.tutorial-card--advanced:hover {
  border-color: var(--color-merge);
  box-shadow: 0 8px 30px rgba(244, 114, 182, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-icon {
  font-size: 2rem;
  line-height: 1;
}

.card-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
}

.card-description {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.card-time {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.card-time svg {
  opacity: 0.7;
}

.card-steps {
  font-weight: 500;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar styling */
.tutorials-grid::-webkit-scrollbar {
  width: 8px;
}

.tutorials-grid::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.tutorials-grid::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.3);
  border-radius: 4px;
}

.tutorials-grid::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.5);
}
</style>
