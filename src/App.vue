<script setup lang="ts">
import { reactive, ref } from "vue";
import Terminal from "./components/Terminal.vue";
import Graph from "./components/Graph.vue";
import FileViewer from "./components/FileViewer.vue";
import Explanation from "./components/Explanation.vue";
import ConceptLegend from "./components/ConceptLegend.vue";
import { makeInitialState, runCommand } from "./engine/gitEngine";

const state = reactive(makeInitialState());

type Line = { kind: "in" | "out" | "err"; text: string; id: number };
let lineId = 0;
const lines = reactive<Line[]>([
  { kind: "out", text: "Welcome to Git in Motion! 🚀", id: lineId++ },
  { kind: "out", text: "Start your journey with: git init", id: lineId++ },
]);

const lastCommand = ref<string>("");

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
    </header>

    <main class="grid">
      <div class="left">
        <Terminal :lines="lines" :onRun="onRun" :state="state" />
      </div>
      <div class="right">
        <Graph :state="state" />
        <FileViewer :state="state" />
        <Explanation :text="state.explanation" :lastCommand="lastCommand" />
        <ConceptLegend />
      </div>
    </main>
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

@media (max-width: 1000px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .header__content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header__concepts {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
