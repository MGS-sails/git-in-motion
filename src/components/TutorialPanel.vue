<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { Tutorial, TutorialStep } from "../engine/tutorialTypes";
import type { RepoState } from "../engine/types";

const props = defineProps<{
  tutorial: Tutorial | null;
  currentStepIndex: number;
  state: RepoState;
  onComplete: () => void;
  onExit: () => void;
  onNextStep: () => void;
}>();

const showHint = ref(false);
const currentHintIndex = ref(0);
const hintsUsed = ref(0);

const currentStep = computed<TutorialStep | null>(() => {
  if (!props.tutorial) return null;
  return props.tutorial.steps[props.currentStepIndex] || null;
});

const progress = computed(() => {
  if (!props.tutorial) return 0;
  return Math.round((props.currentStepIndex / props.tutorial.steps.length) * 100);
});

const isStepComplete = computed(() => {
  if (!currentStep.value) return false;
  return currentStep.value.validate(props.state);
});

const canProceed = computed(() => isStepComplete.value);

const isLastStep = computed(() => {
  if (!props.tutorial) return false;
  return props.currentStepIndex === props.tutorial.steps.length - 1;
});

// Auto-advance when step is complete (with small delay for user to see success)
watch(isStepComplete, (complete) => {
  if (complete && currentStep.value) {
    // Show success state briefly
    setTimeout(() => {
      if (isLastStep.value) {
        props.onComplete();
      }
    }, 500);
  }
});

function handleNextStep() {
  if (!canProceed.value) return;

  // Reset hints for next step
  showHint.value = false;
  currentHintIndex.value = 0;

  props.onNextStep();
}

function showNextHint() {
  if (!currentStep.value) return;

  if (!showHint.value) {
    showHint.value = true;
    currentHintIndex.value = 0;
    hintsUsed.value++;
  } else if (currentHintIndex.value < currentStep.value.hints.length - 1) {
    currentHintIndex.value++;
    hintsUsed.value++;
  }
}

const currentHint = computed(() => {
  if (!showHint.value || !currentStep.value) return null;
  return currentStep.value.hints[currentHintIndex.value];
});

const hasMoreHints = computed(() => {
  if (!currentStep.value) return false;
  return currentHintIndex.value < currentStep.value.hints.length - 1;
});

// Reset hints when step changes
watch(() => props.currentStepIndex, () => {
  showHint.value = false;
  currentHintIndex.value = 0;
});
</script>

<template>
  <div v-if="tutorial" class="tutorial-panel glass-card">
    <!-- Header -->
    <div class="tutorial-header">
      <div class="tutorial-info">
        <span class="tutorial-icon">{{ tutorial.icon }}</span>
        <div>
          <h3 class="tutorial-title">{{ tutorial.title }}</h3>
          <p class="tutorial-meta">
            Step {{ currentStepIndex + 1 }} of {{ tutorial.steps.length }}
            <span class="difficulty-badge" :class="`difficulty-${tutorial.difficulty}`">
              {{ tutorial.difficulty }}
            </span>
          </p>
        </div>
      </div>
      <button @click="onExit" class="btn-close" title="Exit tutorial">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }"></div>
    </div>

    <!-- Current Step -->
    <div v-if="currentStep" class="step-content">
      <div class="step-header">
        <h4 class="step-title">{{ currentStep.title }}</h4>
        <span v-if="isStepComplete" class="step-complete-badge">
          ✓ Complete
        </span>
      </div>

      <p class="step-instruction">{{ currentStep.instruction }}</p>

      <!-- Expected Commands (if available) -->
      <div v-if="currentStep.expectedCommands && currentStep.expectedCommands.length" class="expected-commands">
        <div class="expected-label">Expected command(s):</div>
        <code v-for="cmd in currentStep.expectedCommands" :key="cmd" class="expected-cmd">
          {{ cmd }}
        </code>
      </div>

      <!-- Hint System -->
      <div class="hint-section">
        <button
          v-if="!showHint || hasMoreHints"
          @click="showNextHint"
          class="btn-hint"
          :class="{ 'btn-hint--first': !showHint }"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>
          </svg>
          {{ showHint ? 'Show another hint' : 'Need a hint?' }}
        </button>

        <div v-if="currentHint" class="hint-box">
          <div class="hint-icon">💡</div>
          <div class="hint-text">{{ currentHint }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="tutorial-footer">
      <div class="hints-used">
        {{ hintsUsed }} hint(s) used
      </div>
      <button
        v-if="!isLastStep"
        @click="handleNextStep"
        class="btn-next"
        :disabled="!canProceed"
        :class="{ 'btn-next--ready': canProceed }"
      >
        <span v-if="canProceed">Next Step</span>
        <span v-else>Complete this step first</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
      <button
        v-else
        @click="onComplete"
        class="btn-complete"
        :disabled="!canProceed"
        :class="{ 'btn-complete--ready': canProceed }"
      >
        <span v-if="canProceed">🎉 Complete Tutorial</span>
        <span v-else>Complete this step first</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tutorial-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0;
  overflow: hidden;
  animation: slideInRight 0.4s ease-out;
}

.tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.25rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}

.tutorial-info {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.tutorial-icon {
  font-size: 2rem;
  line-height: 1;
}

.tutorial-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.tutorial-meta {
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.difficulty-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.difficulty-beginner {
  background: rgba(52, 211, 153, 0.15);
  color: var(--color-branch);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.difficulty-intermediate {
  background: rgba(251, 191, 36, 0.15);
  color: var(--color-head);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.difficulty-advanced {
  background: rgba(244, 114, 182, 0.15);
  color: var(--color-merge);
  border: 1px solid rgba(244, 114, 182, 0.3);
}

.btn-close {
  padding: 0.5rem;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-commit);
  color: var(--text-primary);
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-commit), var(--color-branch));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.step-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.step-complete-badge {
  padding: 4px 12px;
  background: rgba(52, 211, 153, 0.2);
  border: 1px solid var(--color-branch);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-branch);
  white-space: nowrap;
  animation: successPulse 0.5s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.step-instruction {
  margin: 0;
  line-height: 1.7;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.expected-commands {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 8px;
}

.expected-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.expected-cmd {
  padding: 6px 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: var(--color-commit);
}

.hint-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 8px;
  color: var(--color-head);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
}

.btn-hint:hover {
  background: rgba(251, 191, 36, 0.2);
  transform: translateY(-1px);
}

.btn-hint--first {
  animation: hintPulse 2s ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(251, 191, 36, 0);
  }
}

.hint-box {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 10px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hint-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.hint-text {
  flex: 1;
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.9rem;
}

.tutorial-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}

.hints-used {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.btn-next,
.btn-complete {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-muted);
}

.btn-next:disabled,
.btn-complete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-next--ready,
.btn-complete--ready {
  background: linear-gradient(135deg, var(--color-commit), #8b5cf6);
  border-color: transparent;
  color: white;
}

.btn-next--ready:hover,
.btn-complete--ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.btn-complete--ready {
  animation: completePulse 1.5s ease-in-out infinite;
}

@keyframes completePulse {
  0%, 100% {
    box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
  }
  50% {
    box-shadow: 0 4px 30px rgba(167, 139, 250, 0.6);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
