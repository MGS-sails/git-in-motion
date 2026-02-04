<script setup lang="ts">
import { reactive } from "vue";
import Terminal from "./components/Terminal.vue";
import Graph from "./components/Graph.vue";
import Explanation from "./components/Explanation.vue";
import { makeInitialState, runCommand } from "./engine/gitEngine";

const state = reactive(makeInitialState());

type Line = { kind: "in" | "out" | "err"; text: string };
const lines = reactive<Line[]>([
  { kind: "out", text: "Git in Motion — a visual mental model." },
  { kind: "out", text: "Start with: git init" },
]);

function onRun(line: string) {
  lines.push({ kind: "in", text: line });
  const res = runCommand(state, line);
  if (!res.ok) lines.push({ kind: "err", text: res.error });
}
</script>

<template>
  <div class="page">
    <header class="header">
      <div class="h1">Git in Motion</div>
      <div class="sub">Commits are nodes. Branches are labels. HEAD shows where you are.</div>
    </header>

    <main class="grid">
      <Terminal :lines="lines" :onRun="onRun" />
      <div class="right">
        <Graph :state="state" />
        <Explanation :text="state.explanation" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.page { padding: 18px; max-width: 1100px; margin: 0 auto; }
.header { margin-bottom: 14px; }
.h1 { font-size: 22px; font-weight: 800; }
.sub { opacity: 0.75; margin-top: 6px; }
.grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 14px; min-height: 78vh; }
.right { display:flex; flex-direction:column; gap: 14px; }
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
