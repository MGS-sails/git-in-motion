<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = defineProps<{
  text: string;
  lastCommand?: string;
}>();

// Track text changes for animation
const animationKey = ref(0);
watch(() => props.text, () => {
  animationKey.value++;
});

// Parse command to identify type
const commandType = computed(() => {
  if (!props.lastCommand) return null;
  const parts = props.lastCommand.split(/\s+/);
  if (parts[0] !== "git") return null;

  const cmd = parts[1];
  switch (cmd) {
    case "init": return { type: "init", icon: "⚡", color: "var(--color-commit)" };
    case "add": return { type: "add", icon: "📦", color: "var(--color-staging)" };
    case "commit": return { type: "commit", icon: "💾", color: "var(--color-commit)" };
    case "branch": return { type: "branch", icon: "🌿", color: "var(--color-branch)" };
    case "switch":
    case "checkout": return { type: "switch", icon: "🔀", color: "var(--color-head)" };
    case "merge": return { type: "merge", icon: "🔗", color: "var(--color-merge)" };
    case "log": return { type: "log", icon: "📜", color: "var(--text-secondary)" };
    default: return null;
  }
});

// Format text with highlighted keywords
const formattedText = computed(() => {
  let result = props.text;

  // Highlight backtick content
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  return result;
});
</script>

<template>
  <div class="explanation glass-card" :key="animationKey">
    <div class="explanation__header">
      <div class="explanation__icon" v-if="commandType" :style="{ color: commandType.color }">
        {{ commandType.icon }}
      </div>
      <div class="explanation__icon explanation__icon--default" v-else>
        💡
      </div>
      <h3 class="explanation__title">What just happened</h3>
    </div>

    <div class="explanation__content">
      <p class="explanation__text" v-html="formattedText"></p>
    </div>

    <div class="explanation__concepts" v-if="commandType">
      <div class="concept-tag" v-if="commandType.type === 'init'">
        <span class="concept-tag__icon">🎯</span>
        <span class="concept-tag__text">Repository initialized with <strong>main</strong> branch</span>
      </div>

      <div class="concept-tag" v-else-if="commandType.type === 'add'">
        <span class="concept-tag__icon">📥</span>
        <span class="concept-tag__text">Changes moved to <strong>staging area</strong></span>
      </div>

      <div class="concept-tag" v-else-if="commandType.type === 'commit'">
        <span class="concept-tag__icon">🔒</span>
        <span class="concept-tag__text">Created a new <strong>snapshot</strong> in history</span>
      </div>

      <div class="concept-tag" v-else-if="commandType.type === 'branch'">
        <span class="concept-tag__icon">🏷️</span>
        <span class="concept-tag__text">Branches are just <strong>movable labels</strong></span>
      </div>

      <div class="concept-tag" v-else-if="commandType.type === 'switch'">
        <span class="concept-tag__icon">👁️</span>
        <span class="concept-tag__text"><strong>HEAD</strong> now points to a different branch</span>
      </div>

      <div class="concept-tag" v-else-if="commandType.type === 'merge'">
        <span class="concept-tag__icon">🔀</span>
        <span class="concept-tag__text">Merge commits have <strong>two parents</strong></span>
      </div>
    </div>

    <div class="explanation__footer">
      <div class="key-insight">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
        <span v-if="!commandType">Type a git command to see what happens</span>
        <span v-else-if="commandType.type === 'commit'">Each commit is immutable — you can't change history, only add to it</span>
        <span v-else-if="commandType.type === 'branch'">Creating branches is instant — they're just 40-byte pointers!</span>
        <span v-else-if="commandType.type === 'switch'">Switching branches doesn't move commits — just your view of them</span>
        <span v-else-if="commandType.type === 'merge'">A merge commit records where two lines of development joined</span>
        <span v-else-if="commandType.type === 'init'">Every Git repo starts with an empty main branch</span>
        <span v-else-if="commandType.type === 'add'">The staging area lets you craft commits precisely</span>
        <span v-else>Watch the graph to see how Git tracks your changes</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explanation {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  animation: fadeInUp 0.4s ease-out;
}

.explanation__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.explanation__icon {
  font-size: 1.5rem;
  animation: bounce 0.5s ease-out;
}

.explanation__icon--default {
  opacity: 0.7;
}

.explanation__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.explanation__content {
  animation: fadeIn 0.5s ease-out 0.1s both;
}

.explanation__text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
}

.explanation__text :deep(code) {
  padding: 2px 8px;
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  color: var(--color-commit);
}

.explanation__concepts {
  animation: slideInRight 0.4s ease-out 0.2s both;
}

.concept-tag {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.concept-tag__icon {
  font-size: 1.1rem;
}

.concept-tag__text strong {
  color: var(--text-primary);
  font-weight: 600;
}

.explanation__footer {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  animation: fadeIn 0.5s ease-out 0.3s both;
}

.key-insight {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}

.key-insight svg {
  flex-shrink: 0;
  margin-top: 2px;
  opacity: 0.6;
}

/* Highlight classes for concepts */
.highlight--commit { color: var(--color-commit); font-weight: 500; }
.highlight--branch { color: var(--color-branch); font-weight: 500; }
.highlight--head { color: var(--color-head); font-weight: 500; }
.highlight--staging { color: var(--color-staging); font-weight: 500; }
.highlight--merge { color: var(--color-merge); font-weight: 500; }
</style>
