<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { RepoState } from "../engine/types";
import {
  listSessions,
  saveSession,
  deleteSession,
  type SavedSession,
} from "../services/indexDB";

const props = defineProps<{
  state: RepoState;
  mode: "basic" | "advanced";
}>();

const emit = defineEmits<{
  (e: "load", session: SavedSession): void;
}>();

const sessions = ref<SavedSession[]>([]);
const saveName = ref("");
const isSaving = ref(false);
const error = ref("");

onMounted(async () => {
  await refreshSessions();
});

async function refreshSessions() {
  try {
    sessions.value = await listSessions();
  } catch {
    error.value = "Could not load sessions from IndexDB.";
  }
}

async function handleSave() {
  const name = saveName.value.trim();
  if (!name) return;
  isSaving.value = true;
  error.value = "";
  try {
    await saveSession(name, props.state, props.mode);
    saveName.value = "";
    await refreshSessions();
  } catch {
    error.value = "Failed to save session.";
  } finally {
    isSaving.value = false;
  }
}

async function handleDelete(id: string) {
  try {
    await deleteSession(id);
    await refreshSessions();
  } catch {
    error.value = "Failed to delete session.";
  }
}

function handleLoad(session: SavedSession) {
  emit("load", session);
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="saved-states glass-card">
    <div class="saved-states__header">
      <div class="saved-states__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <span>Saved Sessions</span>
      </div>
    </div>

    <!-- Save form -->
    <div class="save-form">
      <input
        v-model="saveName"
        type="text"
        placeholder="Session name (e.g. &quot;Before chapter 3 rebase&quot;)"
        class="save-input"
        @keydown.enter="handleSave"
        maxlength="80"
      />
      <button
        class="save-btn"
        :disabled="!saveName.trim() || isSaving"
        @click="handleSave"
      >
        {{ isSaving ? "Saving…" : "Save" }}
      </button>
    </div>

    <p v-if="error" class="saved-states__error">{{ error }}</p>

    <!-- Sessions list -->
    <div class="sessions-list">
      <div v-if="sessions.length === 0" class="sessions-empty">
        <span>No saved sessions yet.</span>
      </div>
      <div
        v-for="s in sessions"
        :key="s.id"
        class="session-item"
      >
        <div class="session-info">
          <div class="session-name">{{ s.name }}</div>
          <div class="session-meta">
            <span class="session-mode" :class="`session-mode--${s.mode}`">{{ s.mode }}</span>
            <span class="session-date">{{ formatDate(s.timestamp) }}</span>
          </div>
        </div>
        <div class="session-actions">
          <button class="session-btn session-btn--load" @click="handleLoad(s)" title="Restore this session">
            Load
          </button>
          <button class="session-btn session-btn--delete" @click="handleDelete(s.id)" title="Delete this session">
            ✕
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.saved-states {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
}

.saved-states__header {
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.saved-states__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.saved-states__title svg {
  color: #34d399;
  flex-shrink: 0;
}

.save-form {
  display: flex;
  gap: 0.5rem;
}

.save-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.save-input:focus {
  border-color: rgba(167, 139, 250, 0.5);
}

.save-input::placeholder {
  color: var(--text-muted);
}

.save-btn {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(74, 222, 128, 0.2));
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.45), rgba(74, 222, 128, 0.3));
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.saved-states__error {
  color: #f87171;
  font-size: 0.8rem;
  margin: 0;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.sessions-empty {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  padding: 1rem 0;
}

.session-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--border-color);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2px;
}

.session-mode {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
}

.session-mode--basic {
  background: rgba(74, 222, 128, 0.15);
  color: var(--color-branch);
}

.session-mode--advanced {
  background: rgba(167, 139, 250, 0.15);
  color: var(--color-commit);
}

.session-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.session-actions {
  display: flex;
  gap: 4px;
}

.session-btn {
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--border-color);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.session-btn--load {
  background: rgba(74, 222, 128, 0.1);
  color: var(--color-branch);
  border-color: rgba(74, 222, 128, 0.2);
}

.session-btn--load:hover {
  background: rgba(74, 222, 128, 0.2);
}

.session-btn--delete {
  background: rgba(248, 113, 113, 0.08);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.2);
}

.session-btn--delete:hover {
  background: rgba(248, 113, 113, 0.18);
}
</style>
