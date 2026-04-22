<script setup lang="ts">
import { ref, watch } from "vue";
import type { PendingInteractiveRebase, InteractiveRebaseStep, InteractiveRebaseAction } from "../engine/types";

const props = defineProps<{
  plan: PendingInteractiveRebase;
}>();

const emit = defineEmits<{
  (e: "execute", steps: InteractiveRebaseStep[]): void;
  (e: "cancel"): void;
}>();

// Local copy of steps for editing
const localSteps = ref<InteractiveRebaseStep[]>([]);

watch(
  () => props.plan,
  (plan) => {
    localSteps.value = plan.steps.map((s) => ({ ...s }));
  },
  { immediate: true }
);

const actions: InteractiveRebaseAction[] = ["pick", "squash", "drop", "reword"];

const actionDescriptions: Record<InteractiveRebaseAction, string> = {
  pick:   "keep commit as-is",
  squash: "meld into previous commit",
  drop:   "delete this commit",
  reword: "keep changes, edit message",
};

const actionColors: Record<InteractiveRebaseAction, string> = {
  pick:   "action--pick",
  squash: "action--squash",
  drop:   "action--drop",
  reword: "action--reword",
};

function handleExecute() {
  emit("execute", localSteps.value);
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('cancel')">
      <div class="modal">
        <div class="modal__header">
          <div class="modal__title">
            <span class="modal__icon">↻</span>
            <div>
              <h2 class="modal__heading">Interactive Rebase</h2>
              <p class="modal__subheading">
                Replaying onto <code>{{ plan.ontoName }}</code>
              </p>
            </div>
          </div>
          <button class="modal__close" @click="emit('cancel')" aria-label="Cancel rebase">✕</button>
        </div>

        <div class="modal__body">
          <p class="modal__intro">
            Adjust the action for each commit. Commits are listed oldest first.
            <strong>Squash</strong> melds a commit into the one above it.
            <strong>Drop</strong> removes it entirely.
          </p>

          <div class="steps-list">
            <div
              v-for="(step, index) in localSteps"
              :key="step.commitId"
              class="step"
              :class="{ 'step--drop': step.action === 'drop' }"
            >
              <div class="step__number">{{ index + 1 }}</div>

              <div class="step__content">
                <div class="step__top">
                  <div class="step__actions">
                    <button
                      v-for="action in actions"
                      :key="action"
                      class="action-btn"
                      :class="[actionColors[action], { 'action-btn--selected': step.action === action }]"
                      @click="step.action = action"
                      :title="actionDescriptions[action]"
                    >
                      {{ action }}
                    </button>
                  </div>
                  <div class="step__commit-id">{{ step.commitId }}</div>
                </div>

                <!-- Message display / edit -->
                <div class="step__message-row">
                  <template v-if="step.action === 'reword'">
                    <input
                      v-model="step.newMessage"
                      :placeholder="step.message"
                      class="step__message-input"
                    />
                  </template>
                  <span v-else class="step__message" :class="{ 'step__message--strikethrough': step.action === 'drop' }">
                    {{ step.message }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal__footer">
          <div class="modal__legend">
            <span v-for="action in actions" :key="action" class="legend-pill" :class="actionColors[action]">
              {{ action }} — {{ actionDescriptions[action] }}
            </span>
          </div>
          <div class="modal__buttons">
            <button class="btn-cancel" @click="emit('cancel')">Cancel</button>
            <button class="btn-execute" @click="handleExecute">
              Execute Rebase
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.modal {
  background: #1a1a2e;
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 20px;
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal__title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal__icon {
  font-size: 2.5rem;
  line-height: 1;
  color: var(--color-head);
}

.modal__heading {
  margin: 0 0 0.25rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-commit), var(--color-head));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal__subheading {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.modal__subheading code {
  color: var(--color-branch);
  background: rgba(74, 222, 128, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

.modal__close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 0.15s;
}

.modal__close:hover {
  color: var(--text-primary);
}

.modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem;
}

.modal__intro {
  margin: 0 0 1.25rem 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.15s;
}

.step--drop {
  opacity: 0.45;
}

.step__number {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-top: 2px;
}

.step__content {
  flex: 1;
  min-width: 0;
}

.step__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.step__actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid transparent;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--border-color);
}

.action-btn:hover {
  color: var(--text-primary);
}

.action-btn--selected.action--pick   { background: rgba(167, 139, 250, 0.2); border-color: rgba(167, 139, 250, 0.5); color: var(--color-commit); }
.action-btn--selected.action--squash { background: rgba(251, 191, 36, 0.2);  border-color: rgba(251, 191, 36, 0.5);  color: var(--color-head); }
.action-btn--selected.action--drop   { background: rgba(248, 113, 113, 0.2); border-color: rgba(248, 113, 113, 0.5); color: #f87171; }
.action-btn--selected.action--reword { background: rgba(74, 222, 128, 0.2);  border-color: rgba(74, 222, 128, 0.5);  color: var(--color-branch); }

.step__commit-id {
  font-family: monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.step__message-row {
  min-height: 22px;
}

.step__message {
  font-size: 0.85rem;
  color: var(--text-primary);
}

.step__message--strikethrough {
  text-decoration: line-through;
  color: var(--text-muted);
}

.step__message-input {
  width: 100%;
  padding: 3px 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 5px;
  color: var(--color-branch);
  font-size: 0.85rem;
  outline: none;
}

.modal__footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.modal__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.legend-pill {
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid transparent;
}

.legend-pill.action--pick   { background: rgba(167, 139, 250, 0.1); border-color: rgba(167, 139, 250, 0.25); color: var(--color-commit); }
.legend-pill.action--squash { background: rgba(251, 191, 36, 0.1);  border-color: rgba(251, 191, 36, 0.25);  color: var(--color-head); }
.legend-pill.action--drop   { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.25); color: #f87171; }
.legend-pill.action--reword { background: rgba(74, 222, 128, 0.1);  border-color: rgba(74, 222, 128, 0.25);  color: var(--color-branch); }

.modal__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.btn-cancel {
  padding: 0.65rem 1.5rem;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

.btn-execute {
  padding: 0.65rem 1.75rem;
  background: linear-gradient(135deg, var(--color-commit), #8b5cf6);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(167, 139, 250, 0.3);
}

.btn-execute:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(167, 139, 250, 0.5);
}
</style>
