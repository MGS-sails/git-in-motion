<script setup lang="ts">
import type { RepoState } from "../engine/types";
import { computed } from "vue";

const props = defineProps<{ state: RepoState }>();

const commitById = computed(() => {
  const m = new Map<string, any>();
  props.state.commits.forEach((c) => m.set(c.id, c));
  return m;
});

const size = computed(() => {
  const maxY = props.state.commits.length ? Math.max(...props.state.commits.map((c) => c.y)) : 0;
  const width = 520;
  const height = 120 + maxY * 90;
  return { width, height };
});

const pos = (x: number, y: number) => {
  const cx = 90 + x * 140;
  const cy = 80 + y * 90;
  return { cx, cy };
};

const headPos = computed(() => {
  if (!props.state.head || props.state.head.type !== "branch") return null;
  const b = props.state.branches[props.state.head.name];
  if (!b?.head) return null;
  const c = commitById.value.get(b.head);
  if (!c) return null;
  const p = pos(c.x, c.y);
  return { ...p, branch: b.name };
});
</script>

<template>
  <div class="graph">
    <div class="title">Commit graph</div>

    <svg :width="size.width" :height="size.height" class="svg">
      <!-- edges -->
      <g class="edges">
        <template v-for="c in state.commits" :key="c.id">
          <template v-for="pId in c.parents" :key="pId">
            <path
                v-if="commitById.get(pId)"
                class="edge"
                :d="(() => {
                const a = pos(c.x, c.y);
                const p = commitById.get(pId);
                const b = pos(p.x, p.y);
                return `M ${a.cx} ${a.cy} C ${a.cx} ${a.cy-40}, ${b.cx} ${b.cy+40}, ${b.cx} ${b.cy}`;
              })()"
            />
          </template>
        </template>
      </g>

      <!-- commits -->
      <g class="commits">
        <g v-for="c in state.commits" :key="c.id" class="commit">
          <circle class="node" :cx="pos(c.x,c.y).cx" :cy="pos(c.x,c.y).cy" r="14" />
          <text class="label" :x="pos(c.x,c.y).cx + 22" :y="pos(c.x,c.y).cy + 5">
            {{ c.message }}
          </text>
          <text class="id" :x="pos(c.x,c.y).cx - 18" :y="pos(c.x,c.y).cy - 20">
            {{ c.id }}
          </text>
        </g>
      </g>

      <!-- branch pointers -->
      <g class="branches">
        <g v-for="b in Object.values(state.branches)" :key="b.name">
          <template v-if="b.head">
            <template v-if="commitById.get(b.head)">
              <g>
                <rect
                    class="branchTag"
                    :x="pos(commitById.get(b.head).x, commitById.get(b.head).y).cx - 30"
                    :y="pos(commitById.get(b.head).x, commitById.get(b.head).y).cy - 44"
                    width="60"
                    height="18"
                    rx="8"
                />
                <text
                    class="branchText"
                    :x="pos(commitById.get(b.head).x, commitById.get(b.head).y).cx"
                    :y="pos(commitById.get(b.head).x, commitById.get(b.head).y).cy - 31"
                    text-anchor="middle"
                >
                  {{ b.name }}
                </text>
              </g>
            </template>
          </template>
        </g>
      </g>

      <!-- HEAD glow -->
      <g v-if="headPos" class="head">
        <circle class="headGlow" :cx="headPos.cx" :cy="headPos.cy" r="22" />
        <text class="headText" :x="headPos.cx" :y="headPos.cy + 45" text-anchor="middle">HEAD</text>
      </g>
    </svg>

    <div class="legend">
      <span class="chip">staging: {{ state.stagingCount }}</span>
      <span class="chip">active: {{ state.activeBranch ?? "none" }}</span>
    </div>
  </div>
</template>

<style scoped>
.graph { border: 1px solid #222; border-radius: 14px; padding: 12px; height: 100%; display:flex; flex-direction:column; gap:10px; }
.title { font-weight: 700; opacity: 0.9; }
.svg { border-radius: 12px; border: 1px solid #222; width: 100%; height: auto; }
.edge { fill: none; stroke: currentColor; opacity: 0.35; stroke-width: 3; }
.node { fill: currentColor; opacity: 0.95; transition: transform 220ms ease; }
.label { font-family: ui-monospace; font-size: 13px; opacity: 0.85; }
.id { font-family: ui-monospace; font-size: 10px; opacity: 0.55; }
.branchTag { fill: currentColor; opacity: 0.18; }
.branchText { font-family: ui-monospace; font-size: 11px; opacity: 0.9; }
.headGlow { fill: none; stroke: currentColor; opacity: 0.4; stroke-width: 6; filter: drop-shadow(0 0 10px currentColor); }
.headText { font-family: ui-monospace; font-size: 12px; opacity: 0.8; }
.legend { display:flex; gap:8px; }
.chip { border: 1px solid #222; border-radius: 999px; padding: 6px 10px; font-size: 12px; opacity: 0.85; }
</style>
