<script setup lang="ts">
import type { RepoState, Commit } from "../engine/types";
import { computed, ref, watch } from "vue";

const props = defineProps<{ state: RepoState }>();

// Track which commits we've seen for animations
const seenCommits = ref(new Set<string>());

// Update seen commits when new ones appear
watch(
  () => props.state.commits.map(c => c.id),
  (ids) => {
    ids.forEach(id => seenCommits.value.add(id));
  },
  { immediate: true }
);

const commitById = computed(() => {
  const m = new Map<string, Commit>();
  props.state.commits.forEach((c) => m.set(c.id, c));
  return m;
});

const size = computed(() => {
  const maxY = props.state.commits.length ? Math.max(...props.state.commits.map((c) => c.y)) : 0;
  const maxX = props.state.commits.length ? Math.max(...props.state.commits.map((c) => c.x)) : 0;
  const width = Math.max(500, 160 + maxX * 160);
  const height = Math.max(200, 140 + maxY * 100);
  return { width, height };
});

const pos = (x: number, y: number) => {
  const cx = 100 + x * 160;
  const cy = 90 + y * 100;
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

// Calculate edge path with bezier curves
const getEdgePath = (commit: Commit, parentId: string) => {
  const parent = commitById.value.get(parentId);
  if (!parent) return "";

  const a = pos(commit.x, commit.y);
  const b = pos(parent.x, parent.y);

  // Create smooth bezier curve
  const midY = (a.cy + b.cy) / 2;
  return `M ${a.cx} ${a.cy} C ${a.cx} ${midY}, ${b.cx} ${midY}, ${b.cx} ${b.cy}`;
};

// Check if commit is a merge commit
const isMergeCommit = (commit: Commit) => commit.parents.length > 1;

// Get animation delay based on commit index
const getCommitDelay = (index: number) => `${index * 0.1}s`;
</script>

<template>
  <div class="graph glass-card">
    <div class="graph__header">
      <div class="graph__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
        </svg>
        <span>Commit Graph</span>
      </div>

      <div class="graph__legend">
        <span class="legend-item legend-item--staging" v-if="state.stagingCount > 0">
          <span class="legend-dot" style="background: var(--color-staging)"></span>
          <span class="legend-count">{{ state.stagingCount }}</span>
          staged
        </span>
        <span class="legend-item legend-item--active" v-if="state.activeBranch">
          <span class="legend-dot" style="background: var(--color-head)"></span>
          {{ state.activeBranch }}
        </span>
      </div>
    </div>

    <div class="graph__canvas">
      <!-- Empty state -->
      <div v-if="!state.initialized" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        </div>
        <p class="empty-text">Run <code>git init</code> to start</p>
      </div>

      <!-- Initialized but no commits -->
      <div v-else-if="state.commits.length === 0" class="empty-state">
        <div class="empty-icon pulse-animation">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" fill="var(--color-staging)" opacity="0.2" />
            <circle cx="12" cy="12" r="4" fill="var(--color-staging)" opacity="0.4" />
          </svg>
        </div>
        <p class="empty-text">
          Add files with <code>git add .</code><br />
          then commit with <code>git commit -m "msg"</code>
        </p>
      </div>

      <!-- SVG Graph -->
      <svg
        v-else
        :width="size.width"
        :height="size.height"
        class="svg"
        :viewBox="`0 0 ${size.width} ${size.height}`"
      >
        <defs>
          <!-- Gradient for edges -->
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--color-commit)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--color-commit)" stop-opacity="0.2" />
          </linearGradient>

          <!-- Gradient for merge edges -->
          <linearGradient id="mergeEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--color-merge)" stop-opacity="0.6" />
            <stop offset="100%" stop-color="var(--color-merge)" stop-opacity="0.2" />
          </linearGradient>

          <!-- Glow filter for HEAD -->
          <filter id="headGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Commit node gradient -->
          <radialGradient id="commitGradient">
            <stop offset="0%" stop-color="var(--color-commit)" />
            <stop offset="100%" stop-color="#7c3aed" />
          </radialGradient>

          <!-- Merge commit gradient -->
          <radialGradient id="mergeGradient">
            <stop offset="0%" stop-color="var(--color-merge)" />
            <stop offset="100%" stop-color="#db2777" />
          </radialGradient>
        </defs>

        <!-- Grid pattern (subtle) -->
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Edges (connections between commits) -->
        <g class="edges">
          <template v-for="c in state.commits" :key="'edge-' + c.id">
            <template v-for="(pId, pIndex) in c.parents" :key="pId">
              <path
                v-if="commitById.get(pId)"
                class="edge"
                :class="{ 'edge--merge': pIndex > 0 }"
                :d="getEdgePath(c, pId)"
                :stroke="pIndex > 0 ? 'url(#mergeEdgeGradient)' : 'url(#edgeGradient)'"
              />
            </template>
          </template>
        </g>

        <!-- HEAD glow ring -->
        <g v-if="headPos" class="head-indicator">
          <circle
            class="head-ring head-ring--outer"
            :cx="headPos.cx"
            :cy="headPos.cy"
            r="32"
          />
          <circle
            class="head-ring head-ring--inner"
            :cx="headPos.cx"
            :cy="headPos.cy"
            r="26"
          />
        </g>

        <!-- Commit nodes -->
        <g class="commits">
          <g
            v-for="(c, index) in state.commits"
            :key="c.id"
            class="commit"
            :style="{ '--delay': getCommitDelay(index) }"
          >
            <!-- Commit glow background -->
            <circle
              class="node-glow"
              :class="{ 'node-glow--merge': isMergeCommit(c) }"
              :cx="pos(c.x, c.y).cx"
              :cy="pos(c.x, c.y).cy"
              r="22"
            />

            <!-- Main commit circle -->
            <circle
              class="node"
              :class="{
                'node--merge': isMergeCommit(c),
                'node--head': state.head?.type === 'branch' && state.branches[state.head.name]?.head === c.id
              }"
              :cx="pos(c.x, c.y).cx"
              :cy="pos(c.x, c.y).cy"
              r="16"
              :fill="isMergeCommit(c) ? 'url(#mergeGradient)' : 'url(#commitGradient)'"
            />

            <!-- Inner highlight -->
            <circle
              class="node-highlight"
              :cx="pos(c.x, c.y).cx - 4"
              :cy="pos(c.x, c.y).cy - 4"
              r="4"
            />

            <!-- Commit ID (hash) -->
            <text
              class="commit-id"
              :x="pos(c.x, c.y).cx"
              :y="pos(c.x, c.y).cy - 28"
              text-anchor="middle"
            >
              {{ c.id }}
            </text>

            <!-- Commit message -->
            <text
              class="commit-message"
              :x="pos(c.x, c.y).cx + 28"
              :y="pos(c.x, c.y).cy + 5"
            >
              {{ c.message }}
            </text>
          </g>
        </g>

        <!-- Branch labels -->
        <g class="branches">
          <g v-for="b in Object.values(state.branches)" :key="b.name">
            <template v-if="b.head && commitById.get(b.head)">
              <g class="branch-label" :class="{ 'branch-label--active': b.name === state.activeBranch }">
                <!-- Branch tag background -->
                <rect
                  class="branch-tag"
                  :x="pos(commitById.get(b.head)!.x, commitById.get(b.head)!.y).cx - 35"
                  :y="pos(commitById.get(b.head)!.x, commitById.get(b.head)!.y).cy - 52"
                  width="70"
                  height="22"
                  rx="11"
                />

                <!-- Branch name -->
                <text
                  class="branch-name"
                  :x="pos(commitById.get(b.head)!.x, commitById.get(b.head)!.y).cx"
                  :y="pos(commitById.get(b.head)!.x, commitById.get(b.head)!.y).cy - 37"
                  text-anchor="middle"
                >
                  {{ b.name }}
                </text>
              </g>
            </template>
          </g>
        </g>

        <!-- HEAD label -->
        <g v-if="headPos" class="head-label">
          <rect
            class="head-tag"
            :x="headPos.cx - 28"
            :y="headPos.cy + 42"
            width="56"
            height="20"
            rx="10"
          />
          <text
            class="head-text"
            :x="headPos.cx"
            :y="headPos.cy + 56"
            text-anchor="middle"
          >
            HEAD
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.graph {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  min-height: 300px;
}

.graph__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.graph__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.graph__title svg {
  color: var(--color-commit);
}

.graph__legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-count {
  font-weight: 600;
  color: var(--color-staging);
}

.legend-item--active {
  padding: 4px 12px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 999px;
  color: var(--color-head);
  font-weight: 500;
}

.graph__canvas {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: auto;
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  opacity: 0.5;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

.empty-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
}

.empty-text code {
  padding: 2px 8px;
  background: rgba(167, 139, 250, 0.15);
  border-radius: 4px;
  color: var(--color-commit);
  font-size: 0.85em;
}

.svg {
  display: block;
}

/* Edges */
.edge {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 0;
  animation: edgeDraw 0.8s ease-out forwards;
}

.edge--merge {
  stroke-dasharray: 8, 4;
  animation: edgeDraw 0.8s ease-out forwards, dashMove 20s linear infinite;
}

@keyframes dashMove {
  to {
    stroke-dashoffset: -100;
  }
}

/* Commit nodes */
.commit {
  animation: nodeAppear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay, 0s) both;
}

.node-glow {
  fill: var(--color-commit);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.node-glow--merge {
  fill: var(--color-merge);
}

.commit:hover .node-glow {
  opacity: 0.2;
}

.node {
  filter: drop-shadow(0 2px 8px rgba(167, 139, 250, 0.3));
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
  cursor: pointer;
}

.node--merge {
  filter: drop-shadow(0 2px 8px rgba(244, 114, 182, 0.3));
}

.node--head {
  filter: drop-shadow(0 0 12px var(--color-head));
}

.commit:hover .node {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 16px rgba(167, 139, 250, 0.5));
}

.node-highlight {
  fill: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}

.commit-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  fill: var(--text-muted);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.commit:hover .commit-id {
  opacity: 1;
}

.commit-message {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  fill: var(--text-secondary);
  transition: fill 0.3s ease;
}

.commit:hover .commit-message {
  fill: var(--text-primary);
}

/* Branch labels */
.branch-label {
  animation: slideInRight 0.4s ease-out both;
}

.branch-tag {
  fill: var(--color-branch);
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.branch-label:hover .branch-tag {
  opacity: 0.3;
}

.branch-label--active .branch-tag {
  opacity: 0.3;
  stroke: var(--color-branch);
  stroke-width: 2;
}

.branch-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  fill: var(--color-branch);
}

/* HEAD indicator */
.head-indicator {
  animation: fadeIn 0.5s ease-out;
}

.head-ring {
  fill: none;
  stroke: var(--color-head);
}

.head-ring--outer {
  stroke-width: 2;
  opacity: 0.2;
  animation: headPulse 2s ease-in-out infinite;
}

.head-ring--inner {
  stroke-width: 3;
  opacity: 0.4;
  animation: headPulse 2s ease-in-out infinite 0.3s;
}

@keyframes headPulse {
  0%, 100% {
    transform-origin: center;
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}

.head-label {
  animation: fadeInUp 0.4s ease-out 0.2s both;
}

.head-tag {
  fill: var(--color-head);
  opacity: 0.25;
}

.head-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  fill: var(--color-head);
}
</style>
