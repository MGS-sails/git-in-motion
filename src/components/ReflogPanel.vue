<script setup lang="ts">
import type { RepoState } from "../engine/types";

const props = defineProps<{ state: RepoState }>();
</script>

<template>
  <div class="reflog glass-card">
    <div class="reflog__header">
      <div class="reflog__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="1 4 1 10 7 10" />
          <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
        </svg>
        <span>Reflog</span>
        <span class="reflog__subtitle">HEAD movement history</span>
      </div>
    </div>

    <div class="reflog__body">
      <div v-if="!state.initialized || state.reflog.length === 0" class="reflog__empty">
        <span class="reflog__empty-icon">📋</span>
        <p>No reflog entries yet.<br />Actions appear here as you use git commands.</p>
      </div>

      <div v-else class="reflog__list">
        <div
          v-for="entry in state.reflog"
          :key="entry.index"
          class="reflog__entry"
        >
          <div class="reflog__index">HEAD@{{ '{' }}{{ entry.index }}{{ '}' }}</div>
          <div class="reflog__details">
            <div class="reflog__action">
              <span class="reflog__action-badge" :class="`reflog__action-badge--${entry.action}`">
                {{ entry.action }}
              </span>
              <span class="reflog__ref">{{ entry.headRef }}</span>
            </div>
            <div class="reflog__message">{{ entry.message }}</div>
            <div v-if="entry.commitId" class="reflog__commit-id">{{ entry.commitId }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="reflog__footer" v-if="state.reflog.length > 0">
      <p class="reflog__tip">
        Recover with: <code>git reset --hard HEAD@&#123;N&#125;</code>
      </p>
    </div>
  </div>
</template>

<style scoped>
.reflog {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1.25rem;
  max-height: 320px;
}

.reflog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.75rem;
}

.reflog__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.reflog__title svg {
  color: #60a5fa;
  flex-shrink: 0;
}

.reflog__subtitle {
  font-weight: 400;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.reflog__body {
  flex: 1;
  overflow-y: auto;
  min-height: 60px;
}

.reflog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.reflog__empty-icon {
  font-size: 1.5rem;
}

.reflog__list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reflog__entry {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.reflog__entry:hover {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.reflog__index {
  font-family: monospace;
  font-size: 0.7rem;
  color: #60a5fa;
  white-space: nowrap;
  padding-top: 2px;
  min-width: 72px;
}

.reflog__details {
  flex: 1;
  min-width: 0;
}

.reflog__action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2px;
}

.reflog__action-badge {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(167, 139, 250, 0.15);
  color: var(--color-commit);
}

.reflog__action-badge--commit { background: rgba(167, 139, 250, 0.15); color: var(--color-commit); }
.reflog__action-badge--reset  { background: rgba(251, 113, 133, 0.15); color: #f87171; }
.reflog__action-badge--merge  { background: rgba(251, 113, 133, 0.2);  color: var(--color-merge); }
.reflog__action-badge--rebase { background: rgba(251, 191, 36, 0.15);  color: var(--color-head); }
.reflog__action-badge--checkout { background: rgba(74, 222, 128, 0.15); color: var(--color-branch); }
.reflog__action-badge--tag    { background: rgba(251, 191, 36, 0.2);   color: #fbbf24; }
.reflog__action-badge--cherry-pick { background: rgba(239, 68, 68, 0.1); color: #f87171; }

.reflog__ref {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-branch);
  font-family: monospace;
}

.reflog__message {
  font-size: 0.8rem;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reflog__commit-id {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 1px;
}

.reflog__footer {
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
  margin-top: 0.75rem;
}

.reflog__tip {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
}

.reflog__tip code {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.07);
  padding: 1px 5px;
  border-radius: 4px;
  color: var(--color-commit);
}
</style>
