<script setup lang="ts">
defineProps<{ modelValue: "basic" | "advanced" }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: "basic" | "advanced"): void;
}>();

function toggle(val: "basic" | "advanced") {
  emit("update:modelValue", val);
}
</script>

<template>
  <div class="mode-switch" role="group" aria-label="Mode switch">
    <button
      class="mode-btn"
      :class="{ 'mode-btn--active': modelValue === 'basic' }"
      @click="toggle('basic')"
      :aria-pressed="modelValue === 'basic'"
    >
      <span class="mode-icon">🌱</span>
      <span class="mode-label">Basic</span>
    </button>
    <div class="mode-divider"></div>
    <button
      class="mode-btn"
      :class="{ 'mode-btn--active': modelValue === 'advanced' }"
      @click="toggle('advanced')"
      :aria-pressed="modelValue === 'advanced'"
    >
      <span class="mode-icon">🔬</span>
      <span class="mode-label">Advanced</span>
    </button>
  </div>
</template>

<style scoped>
.mode-switch {
  display: inline-flex;
  align-items: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 4px;
  gap: 2px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.mode-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.mode-btn--active {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.25), rgba(74, 222, 128, 0.15));
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.3);
}

.mode-btn--active:hover {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.35), rgba(74, 222, 128, 0.25));
}

.mode-icon {
  font-size: 1rem;
  line-height: 1;
}

.mode-divider {
  width: 1px;
  height: 20px;
  background: var(--border-color);
}

.mode-label {
  font-size: 0.875rem;
}
</style>
