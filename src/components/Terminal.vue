<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  onRun: (line: string) => void;
  lines: { kind: "in" | "out" | "err"; text: string }[];
}>();

const input = ref("");

function submit() {
  const line = input.value.trim();
  if (!line) return;
  props.onRun(line);
  input.value = "";
}
</script>

<template>
  <div class="terminal">
    <div class="title">Terminal</div>

    <div class="screen">
      <div v-for="(l, i) in lines" :key="i" class="line" :class="l.kind">
        <span v-if="l.kind === 'in'">$ </span>{{ l.text }}
      </div>
    </div>

    <form class="prompt" @submit.prevent="submit">
      <span class="dollar">$</span>
      <input v-model="input" placeholder="git init" />
      <button type="submit">Run</button>
    </form>

    <div class="hints">
      Try: <code>git init</code>, <code>git add .</code>, <code>git commit -m "msg"</code>,
      <code>git branch feature</code>, <code>git switch feature</code>, <code>git merge feature</code>
    </div>
  </div>
</template>

<style scoped>
.terminal { border: 1px solid #222; border-radius: 14px; padding: 12px; height: 100%; display:flex; flex-direction:column; gap:10px; }
.title { font-weight: 700; opacity: 0.9; }
.screen { flex: 1; overflow: auto; border-radius: 12px; padding: 10px; border: 1px solid #222; }
.line { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; padding: 2px 0; }
.line.out { opacity: 0.85; }
.line.err { opacity: 0.9; }
.prompt { display:flex; gap:8px; align-items:center; }
.dollar { font-family: ui-monospace; opacity: 0.8; }
input { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #222; background: transparent; color: inherit; }
button { padding: 10px 12px; border-radius: 10px; border: 1px solid #222; background: transparent; color: inherit; cursor: pointer; }
.hints { font-size: 12px; opacity: 0.75; }
code { font-family: ui-monospace; }
</style>
