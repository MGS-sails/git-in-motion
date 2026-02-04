<script setup lang="ts">
import { ref, nextTick, watch, computed } from "vue";
import type { RepoState } from "../engine/types";

const props = defineProps<{
  onRun: (line: string) => void;
  lines: { kind: "in" | "out" | "err"; text: string; id: number }[];
  state: RepoState;
}>();

const input = ref("");
const screenRef = ref<HTMLElement | null>(null);

const quickCommands = computed(() => {
  const hasBranches = Object.keys(props.state.branches).length > 1;
  const hasCommits = props.state.commits.length > 0;
  const hasMultipleCommits = props.state.commits.length > 1;

  return [
    // Row 1: Basics
    { cmd: "git init", label: "init", icon: "⚡", available: !props.state.initialized, group: "basic" },
    { cmd: "git add .", label: "add", icon: "📦", available: props.state.initialized, group: "basic" },
    { cmd: 'git commit -m "update"', label: "commit", icon: "💾", available: props.state.initialized && props.state.stagingCount > 0, group: "basic" },

    // Row 2: Branching
    { cmd: "git branch feature", label: "branch", icon: "🌿", available: props.state.initialized && hasCommits, group: "branch" },
    { cmd: "git switch", label: "switch", icon: "🔀", available: props.state.initialized && hasBranches, group: "branch" },
    { cmd: "git merge", label: "merge", icon: "🔗", available: props.state.initialized && hasBranches, group: "branch" },

    // Row 3: Advanced
    { cmd: "git rebase", label: "rebase", icon: "↻", available: props.state.initialized && hasBranches, group: "advanced" },
    { cmd: "git reset --soft HEAD~1", label: "reset", icon: "⏪", available: props.state.initialized && hasMultipleCommits, group: "advanced" },
    { cmd: "git revert", label: "revert", icon: "↩️", available: props.state.initialized && hasCommits, group: "advanced" },
    { cmd: "git cherry-pick", label: "cherry", icon: "🍒", available: props.state.initialized && hasMultipleCommits, group: "advanced" },

    // Row 4: Utility
    { cmd: "git stash", label: "stash", icon: "📥", available: props.state.initialized && props.state.stagingCount > 0, group: "util" },
    { cmd: "git stash pop", label: "pop", icon: "📤", available: props.state.initialized && props.state.stash.length > 0, group: "util" },
    { cmd: "git status", label: "status", icon: "📊", available: props.state.initialized, group: "util" },
    { cmd: "git log", label: "log", icon: "📜", available: props.state.initialized && hasCommits, group: "util" },
  ];
});

function submit() {
  const line = input.value.trim();
  if (!line) return;
  props.onRun(line);
  input.value = "";
}

function runQuick(cmd: string) {
  props.onRun(cmd);
}

// Auto-scroll to bottom when new lines are added
watch(() => props.lines.length, async () => {
  await nextTick();
  if (screenRef.value) {
    screenRef.value.scrollTop = screenRef.value.scrollHeight;
  }
});
</script>

<template>
  <div class="terminal glass-card">
    <div class="terminal__header">
      <div class="terminal__dots">
        <span class="dot dot--red"></span>
        <span class="dot dot--yellow"></span>
        <span class="dot dot--green"></span>
      </div>
      <span class="terminal__title">Terminal</span>
      <div class="terminal__status">
        <span v-if="state.initialized" class="status-badge status-badge--active">
          <span class="status-dot"></span>
          Repository Active
        </span>
        <span v-else class="status-badge status-badge--inactive">
          No Repository
        </span>
      </div>
    </div>

    <div class="quick-commands">
      <button
        v-for="qc in quickCommands"
        :key="qc.cmd"
        class="quick-btn"
        :class="{ 'quick-btn--available': qc.available, 'quick-btn--disabled': !qc.available }"
        @click="qc.available && runQuick(qc.cmd)"
        :disabled="!qc.available"
        :title="qc.cmd"
      >
        <span class="quick-btn__icon">{{ qc.icon }}</span>
        <span class="quick-btn__label">{{ qc.label }}</span>
      </button>
    </div>

    <div ref="screenRef" class="screen">
      <TransitionGroup name="line">
        <div
          v-for="l in lines"
          :key="l.id"
          class="line"
          :class="[`line--${l.kind}`]"
        >
          <span v-if="l.kind === 'in'" class="line__prompt">$</span>
          <span v-else-if="l.kind === 'err'" class="line__icon">✗</span>
          <span v-else class="line__icon line__icon--info">›</span>
          <span class="line__text">{{ l.text }}</span>
        </div>
      </TransitionGroup>
    </div>

    <form class="prompt" @submit.prevent="submit">
      <span class="prompt__symbol">$</span>
      <input
        v-model="input"
        class="prompt__input"
        placeholder="Type a git command..."
        autocomplete="off"
        spellcheck="false"
      />
      <button type="submit" class="prompt__btn">
        <span>Run</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </form>

    <div class="hints">
      <div class="hints__title">Available commands:</div>
      <div class="hints__grid">
        <div class="hints__group">
          <span class="hints__group-title">Basics</span>
          <code class="hint-cmd">git init</code>
          <code class="hint-cmd">git add .</code>
          <code class="hint-cmd">git commit -m "msg"</code>
        </div>
        <div class="hints__group">
          <span class="hints__group-title">Branches</span>
          <code class="hint-cmd">git branch &lt;name&gt;</code>
          <code class="hint-cmd">git switch &lt;name&gt;</code>
          <code class="hint-cmd">git merge &lt;branch&gt;</code>
        </div>
        <div class="hints__group">
          <span class="hints__group-title">History</span>
          <code class="hint-cmd">git rebase &lt;branch&gt;</code>
          <code class="hint-cmd">git reset --soft/--hard</code>
          <code class="hint-cmd">git revert &lt;commit&gt;</code>
          <code class="hint-cmd">git cherry-pick &lt;commit&gt;</code>
        </div>
        <div class="hints__group">
          <span class="hints__group-title">Utility</span>
          <code class="hint-cmd">git stash / pop / list</code>
          <code class="hint-cmd">git status</code>
          <code class="hint-cmd">git log</code>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  min-height: 500px;
}

.terminal__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.terminal__dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.dot:hover {
  transform: scale(1.2);
}

.dot--red { background: #ff5f57; }
.dot--yellow { background: #febc2e; }
.dot--green { background: #28c840; }

.terminal__title {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.terminal__status {
  margin-left: auto;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge--active {
  background: rgba(52, 211, 153, 0.15);
  color: var(--color-branch);
  border: 1px solid rgba(52, 211, 153, 0.3);
}

.status-badge--inactive {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-branch);
  animation: pulse 2s ease-in-out infinite;
}

.quick-commands {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-btn--available {
  color: var(--text-primary);
  border-color: rgba(167, 139, 250, 0.3);
}

.quick-btn--available:hover {
  background: rgba(167, 139, 250, 0.15);
  border-color: var(--color-commit);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.2);
}

.quick-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.quick-btn__icon {
  font-size: 1rem;
}

.quick-btn__label {
  font-family: 'JetBrains Mono', monospace;
}

.screen {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
}

.line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 0;
  line-height: 1.5;
}

.line--in {
  color: var(--text-primary);
}

.line--out {
  color: var(--text-secondary);
}

.line--err {
  color: #f87171;
}

.line__prompt {
  color: var(--color-commit);
  font-weight: 600;
  user-select: none;
}

.line__icon {
  user-select: none;
  opacity: 0.7;
}

.line__icon--info {
  color: var(--color-branch);
}

.line__text {
  flex: 1;
  word-break: break-word;
}

/* Line transition animations */
.line-enter-active {
  animation: lineAppear 0.4s ease-out;
}

.line-leave-active {
  animation: lineAppear 0.3s ease-in reverse;
}

@keyframes lineAppear {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.prompt {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.prompt:focus-within {
  border-color: var(--color-commit);
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.1);
}

.prompt__symbol {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--color-commit);
  padding-left: 8px;
}

.prompt__input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 8px 4px;
  font-size: 0.95rem;
}

.prompt__input:focus {
  outline: none;
  box-shadow: none;
}

.prompt__btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, var(--color-commit), #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.prompt__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(167, 139, 250, 0.4);
}

.prompt__btn:active {
  transform: translateY(0);
}

.hints {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
}

.hints__title {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hints__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.hints__group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hints__group-title {
  font-size: 0.65rem;
  color: var(--color-commit);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
  font-weight: 600;
}

.hint-cmd {
  padding: 3px 8px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  cursor: default;
}

.hint-cmd:hover {
  border-color: var(--color-commit);
  color: var(--text-primary);
}
</style>
