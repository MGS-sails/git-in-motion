<script setup lang="ts">
import { reactive, ref } from "vue";
import Terminal from "./components/Terminal.vue";
import Graph from "./components/Graph.vue";
import FileViewer from "./components/FileViewer.vue";
import Explanation from "./components/Explanation.vue";
import ConceptLegend from "./components/ConceptLegend.vue";
import TutorialSelector from "./components/TutorialSelector.vue";
import TutorialPanel from "./components/TutorialPanel.vue";
import { makeInitialState, runCommand } from "./engine/gitEngine";
import type { Tutorial } from "./engine/tutorialTypes";

const state = reactive(makeInitialState());

type Line = { kind: "in" | "out" | "err"; text: string; id: number };
let lineId = 0;
const lines = reactive<Line[]>([
  { kind: "out", text: "Welcome to Git in Motion! 🚀", id: lineId++ },
  { kind: "out", text: "Start your journey with: git init", id: lineId++ },
]);

const lastCommand = ref<string>("");

// Tutorial state
const showTutorialSelector = ref(false);
const currentTutorial = ref<Tutorial | null>(null);
const currentStepIndex = ref(0);
const showCompletionModal = ref(false);

function onRun(line: string) {
  lines.push({ kind: "in", text: line, id: lineId++ });
  lastCommand.value = line;
  const res = runCommand(state, line);
  if (!res.ok) {
    lines.push({ kind: "err", text: res.error, id: lineId++ });
  } else if (res.message) {
    lines.push({ kind: "out", text: res.message, id: lineId++ });
  }
}

function startTutorial(tutorial: Tutorial) {
  currentTutorial.value = tutorial;
  currentStepIndex.value = 0;
  showTutorialSelector.value = false;

  // Reset state for tutorial
  Object.assign(state, makeInitialState());
  lines.length = 0;
  lineId = 0;
  lines.push({ kind: "out", text: `🎓 Starting: ${tutorial.title}`, id: lineId++ });
  lines.push({ kind: "out", text: tutorial.description, id: lineId++ });
}

function exitTutorial() {
  currentTutorial.value = null;
  currentStepIndex.value = 0;
  showCompletionModal.value = false;
}

function nextStep() {
  if (!currentTutorial.value) return;
  if (currentStepIndex.value < currentTutorial.value.steps.length - 1) {
    currentStepIndex.value++;
  }
}

function completeTutorial() {
  showCompletionModal.value = true;
  // Auto-close after 3 seconds
  setTimeout(() => {
    showCompletionModal.value = false;
    exitTutorial();
  }, 3000);
}

function openTutorialSelector() {
  showTutorialSelector.value = true;
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="header__content">
        <div class="header__brand">
          <div class="header__icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="6" r="3" fill="var(--color-commit)" />
              <circle cx="6" cy="18" r="3" fill="var(--color-branch)" />
              <circle cx="18" cy="18" r="3" fill="var(--color-merge)" />
              <path d="M12 9 L12 12 L6 15" stroke="var(--color-commit)" stroke-width="2" stroke-linecap="round" />
              <path d="M12 12 L18 15" stroke="var(--color-merge)" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div>
            <h1 class="header__title">Git in Motion</h1>
            <p class="header__subtitle">Visual mental model for version control</p>
          </div>
        </div>
        <div class="header__actions">
          <button @click="openTutorialSelector" class="btn-tutorial" v-if="!currentTutorial">
            <span class="tutorial-icon">🎓</span>
            <span>Start Learning</span>
          </button>
          <div class="header__concepts">
            <span class="chip chip--commit">
              <span class="chip__dot" style="background: var(--color-commit)"></span>
              Commits = Nodes
            </span>
            <span class="chip chip--branch">
              <span class="chip__dot" style="background: var(--color-branch)"></span>
              Branches = Labels
            </span>
            <span class="chip chip--head">
              <span class="chip__dot" style="background: var(--color-head)"></span>
              HEAD = You are here
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="grid">
      <div class="left">
        <Terminal :lines="lines" :onRun="onRun" :state="state" />
      </div>
      <div class="right">
        <Graph :state="state" />
        <FileViewer :state="state" />

        <!-- Tutorial Selector (when no tutorial is active) -->
        <TutorialSelector
          v-if="showTutorialSelector && !currentTutorial"
          @select="startTutorial"
          @close="showTutorialSelector = false"
        />

        <!-- Tutorial Panel (when tutorial is active) -->
        <TutorialPanel
          v-else-if="currentTutorial"
          :tutorial="currentTutorial"
          :currentStepIndex="currentStepIndex"
          :state="state"
          @complete="completeTutorial"
          @exit="exitTutorial"
          @nextStep="nextStep"
        />

        <!-- Default Explanation (when no tutorial) -->
        <Explanation v-else :text="state.explanation" :lastCommand="lastCommand" />

        <ConceptLegend />
      </div>
    </main>

    <!-- Completion Modal -->
    <Transition name="modal">
      <div v-if="showCompletionModal" class="modal-overlay" @click="showCompletionModal = false">
        <div class="completion-modal" @click.stop>
          <div class="completion-icon">🎉</div>
          <h2 class="completion-title">Tutorial Complete!</h2>
          <p class="completion-message">
            Great job! You've completed "{{ currentTutorial?.title }}"
          </p>
          <button @click="showCompletionModal = false; exitTutorial()" class="btn-completion">
            Continue Learning
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 2rem;
}

.header {
  padding: 1rem 0 1.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  animation: fadeInUp 0.6s ease-out;
}

.header__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header__icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  animation: pulse 3s ease-in-out infinite;
}

.header__title {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-commit) 0%, var(--color-branch) 50%, var(--color-head) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header__subtitle {
  margin: 0.25rem 0 0 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.header__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1rem;
}

.btn-tutorial {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--color-commit), #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
  animation: tutorialPulse 2s ease-in-out infinite;
}

.btn-tutorial:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(167, 139, 250, 0.5);
}

.tutorial-icon {
  font-size: 1.2rem;
  line-height: 1;
}

@keyframes tutorialPulse {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
  }
  50% {
    box-shadow: 0 6px 25px rgba(167, 139, 250, 0.5);
  }
}

.header__concepts {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.grid {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(400px, 1.6fr);
  gap: 1.5rem;
  min-height: calc(100vh - 180px);
}

.left {
  display: flex;
  flex-direction: column;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

/* Completion Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.completion-modal {
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 500px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.completion-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: celebrationBounce 0.6s ease-out;
}

@keyframes celebrationBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

.completion-title {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-commit), var(--color-branch));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.completion-message {
  margin: 0 0 2rem 0;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
}

.btn-completion {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--color-commit), #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.btn-completion:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(167, 139, 250, 0.6);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .completion-modal {
  animation: modalSlideUp 0.4s ease-out;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .header__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header__actions {
    width: 100%;
    align-items: flex-start;
  }

  .header__concepts {
    width: 100%;
    justify-content: flex-start;
  }

  .completion-modal {
    margin: 1rem;
    padding: 2rem 1.5rem;
  }
}
</style>
