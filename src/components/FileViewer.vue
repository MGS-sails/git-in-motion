<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { RepoState } from "../engine/types";

const props = defineProps<{
  state: RepoState;
}>();

const isExpanded = ref(true);
const selectedFile = ref<string>("main.py");
const isEditing = ref(false);
const editContent = ref("");

// Auto-expand when conflicts occur
watch(() => props.state.conflicts.length, (newCount, oldCount) => {
  if (newCount > 0 && oldCount === 0) {
    isExpanded.value = true;
  }
});

// Show staging area if not empty, otherwise working directory
const displayFiles = computed(() => {
  return props.state.stagingArea.length > 0
    ? props.state.stagingArea
    : props.state.workingDirectory;
});

const currentFile = computed(() => {
  return displayFiles.value.find(f => f.path === selectedFile.value);
});

const conflictForFile = computed(() => {
  return props.state.conflicts.find(c => c.path === selectedFile.value);
});

const hasConflicts = computed(() => props.state.conflicts.length > 0);

function selectFile(path: string) {
  selectedFile.value = path;
  isEditing.value = false;
}

function startEdit() {
  isEditing.value = true;
  editContent.value = currentFile.value?.content || "";
}

function saveEdit() {
  if (!currentFile.value) return;

  // Update working directory
  const fileIndex = props.state.workingDirectory.findIndex(
    f => f.path === selectedFile.value
  );
  if (fileIndex >= 0 && props.state.workingDirectory[fileIndex]) {
    props.state.workingDirectory[fileIndex]!.content = editContent.value;
  }

  isEditing.value = false;
}

function cancelEdit() {
  isEditing.value = false;
  editContent.value = "";
}

function getFileIcon(path: string): string {
  if (path.endsWith('.py')) return '🐍';
  if (path.endsWith('.md')) return '📝';
  if (path.endsWith('.js') || path.endsWith('.ts')) return '📜';
  return '📄';
}

function highlightSyntax(content: string, path: string): string {
  if (!path.endsWith('.py')) return content;

  // Basic Python syntax highlighting
  return content
    .replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|with|lambda|yield|raise|pass|break|continue)\b/g, '<span class="keyword">$1</span>')
    .replace(/(#.*$)/gm, '<span class="comment">$1</span>')
    .replace(/(".*?"|\'.*?\')/g, '<span class="string">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
}

function acceptOurs() {
  const conflict = conflictForFile.value;
  if (!conflict) return;

  const fileIndex = props.state.workingDirectory.findIndex(
    f => f.path === selectedFile.value
  );
  if (fileIndex >= 0 && props.state.workingDirectory[fileIndex]) {
    props.state.workingDirectory[fileIndex]!.content = conflict.ours;
    props.state.workingDirectory[fileIndex]!.isConflicted = false;
  }

  // Remove from conflicts
  props.state.conflicts = props.state.conflicts.filter(
    c => c.path !== selectedFile.value
  );
}

function acceptTheirs() {
  const conflict = conflictForFile.value;
  if (!conflict) return;

  const fileIndex = props.state.workingDirectory.findIndex(
    f => f.path === selectedFile.value
  );
  if (fileIndex >= 0 && props.state.workingDirectory[fileIndex]) {
    props.state.workingDirectory[fileIndex]!.content = conflict.theirs;
    props.state.workingDirectory[fileIndex]!.isConflicted = false;
  }

  // Remove from conflicts
  props.state.conflicts = props.state.conflicts.filter(
    c => c.path !== selectedFile.value
  );
}

function highlightConflicts(content: string): string {
  return content
    .replace(/^<{7} .*$/gm, '<span class="conflict-ours">$&</span>')
    .replace(/^={7}$/gm, '<span class="conflict-separator">$&</span>')
    .replace(/^>{7} .*$/gm, '<span class="conflict-theirs">$&</span>');
}
</script>

<template>
  <div class="file-viewer glass-card">
    <div class="file-viewer__header" @click="isExpanded = !isExpanded">
      <div class="file-viewer__title">
        <span>📄 File Viewer</span>
        <span v-if="state.stagingArea.length > 0" class="staging-badge">📦 Staging Area</span>
        <span v-else class="working-badge">✏️ Working Directory</span>
        <span v-if="hasConflicts" class="conflict-badge">⚠️ {{ state.conflicts.length }} conflict(s)</span>
      </div>
      <span class="toggle-icon" :class="{ expanded: isExpanded }">▼</span>
    </div>

    <transition name="expand">
      <div v-if="isExpanded" class="file-viewer__content">
      <!-- File tabs -->
      <div class="file-tabs">
        <button
          v-for="file in displayFiles"
          :key="file.path"
          :class="['file-tab', { active: selectedFile === file.path, conflicted: file.isConflicted }]"
          @click="selectFile(file.path)"
        >
          {{ getFileIcon(file.path) }} {{ file.path }}
          <span v-if="file.isConflicted" class="conflict-dot">⚠️</span>
        </button>
      </div>

      <!-- Conflict banner -->
      <div v-if="conflictForFile" class="conflict-banner">
        <div class="conflict-banner__text">
          ⚠️ Merge conflict detected in {{ selectedFile }}
        </div>
        <div class="conflict-banner__actions">
          <button @click="acceptOurs" class="btn-small btn-ours">Accept Ours</button>
          <button @click="acceptTheirs" class="btn-small btn-theirs">Accept Theirs</button>
          <button @click="startEdit" class="btn-small">Edit Manually</button>
        </div>
      </div>

      <!-- File content -->
      <div v-if="currentFile" class="file-content">
        <div v-if="!isEditing" class="file-display" @click="startEdit">
          <pre v-if="currentFile.isConflicted" v-html="highlightConflicts(currentFile.content)"></pre>
          <pre v-else v-html="highlightSyntax(currentFile.content, currentFile.path)"></pre>
        </div>

        <div v-else class="file-editor">
          <textarea
            v-model="editContent"
            class="file-textarea"
            spellcheck="false"
          ></textarea>
          <div class="editor-actions">
            <button @click="saveEdit" class="btn-small btn-save">Save</button>
            <button @click="cancelEdit" class="btn-small">Cancel</button>
          </div>
        </div>
      </div>

      <div v-else class="file-empty">
        No file selected
      </div>
    </div>
    </transition>
  </div>
</template>

<style scoped>
.file-viewer {
  padding: 0;
  overflow: hidden;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.file-viewer__header {
  padding: 1rem 1.25rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
  user-select: none;
  transition: background 0.3s ease;
}

.file-viewer__header:hover {
  background: rgba(255, 255, 255, 0.02);
}

.file-viewer__title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
}

.conflict-badge {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.15);
  color: var(--color-head);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.staging-badge {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(96, 165, 250, 0.15);
  color: var(--color-staging);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(96, 165, 250, 0.3);
}

.working-badge {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--border-color);
}

.toggle-icon {
  color: var(--text-muted);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: rotate(-90deg);
}

.toggle-icon.expanded {
  transform: rotate(0deg);
}

.file-viewer__content {
  animation: fadeIn 0.4s ease-out;
}

.file-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
}

.file-tab {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.file-tab:hover {
  border-color: var(--color-commit);
  color: var(--text-primary);
}

.file-tab.active {
  background: rgba(167, 139, 250, 0.15);
  border-color: var(--color-commit);
  color: var(--color-commit);
}

.file-tab.conflicted {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.1);
}

.conflict-dot {
  font-size: 0.75rem;
}

.conflict-banner {
  padding: 1rem;
  background: rgba(251, 191, 36, 0.1);
  border-bottom: 1px solid rgba(251, 191, 36, 0.3);
}

.conflict-banner__text {
  color: var(--color-head);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.conflict-banner__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-small {
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-small:hover {
  border-color: var(--color-commit);
  transform: translateY(-1px);
}

.btn-ours {
  border-color: rgba(52, 211, 153, 0.5);
  color: var(--color-branch);
}

.btn-ours:hover {
  background: rgba(52, 211, 153, 0.15);
}

.btn-theirs {
  border-color: rgba(244, 114, 182, 0.5);
  color: var(--color-merge);
}

.btn-theirs:hover {
  background: rgba(244, 114, 182, 0.15);
}

.btn-save {
  border-color: rgba(52, 211, 153, 0.5);
  color: var(--color-branch);
}

.btn-save:hover {
  background: rgba(52, 211, 153, 0.15);
}

.file-content {
  min-height: 300px;
  max-height: 500px;
}

.file-display {
  padding: 1.5rem;
  cursor: text;
  overflow: auto;
  max-height: 500px;
}

.file-display pre {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.file-display :deep(.keyword) {
  color: #c678dd;
  font-weight: 600;
}

.file-display :deep(.comment) {
  color: #5c6370;
  font-style: italic;
}

.file-display :deep(.string) {
  color: #98c379;
}

.file-display :deep(.number) {
  color: #d19a66;
}

.file-display :deep(.conflict-ours) {
  color: var(--color-branch);
  background: rgba(52, 211, 153, 0.1);
  display: block;
  padding: 2px 4px;
}

.file-display :deep(.conflict-separator) {
  color: var(--color-head);
  background: rgba(251, 191, 36, 0.1);
  display: block;
  padding: 2px 4px;
}

.file-display :deep(.conflict-theirs) {
  color: var(--color-merge);
  background: rgba(244, 114, 182, 0.1);
  display: block;
  padding: 2px 4px;
}

.file-editor {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.file-textarea {
  flex: 1;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  color: var(--text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;
  outline: none;
}

.editor-actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.1);
}

.file-empty {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Expand/collapse transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 600px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
