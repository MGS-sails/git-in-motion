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

// Layout constants - much more spacious
const LANE_WIDTH = 220;      // Horizontal spacing between lanes
const ROW_HEIGHT = 140;      // Vertical spacing between commits
const PADDING_X = 140;       // Left padding
const PADDING_Y = 100;       // Top padding
const NODE_RADIUS = 24;      // Larger commit nodes

const size = computed(() => {
  const maxY = props.state.commits.length ? Math.max(...props.state.commits.map((c) => c.y)) : 0;
  const maxX = props.state.commits.length ? Math.max(...props.state.commits.map((c) => c.x)) : 0;
  const width = Math.max(600, PADDING_X * 2 + maxX * LANE_WIDTH + 200);
  const height = Math.max(400, PADDING_Y * 2 + maxY * ROW_HEIGHT + 100);
  return { width, height };
});

const pos = (x: number, y: number) => {
  const cx = PADDING_X + x * LANE_WIDTH;
  const cy = PADDING_Y + y * ROW_HEIGHT;
  return { cx, cy };
};

// Get all commits reachable from branch heads
const reachableCommits = computed(() => {
  const reachable = new Set<string>();
  const branchHeads = Object.values(props.state.branches)
    .map(b => b.head)
    .filter((h): h is string => h !== null);

  // Also include detached HEAD if applicable
  if (props.state.head?.type === "detached") {
    branchHeads.push(props.state.head.commit);
  }

  const stack = [...branchHeads];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    const commit = commitById.value.get(id);
    if (commit) {
      stack.push(...commit.parents);
    }
  }
  return reachable;
});

// Check if a commit is orphaned (not reachable from any branch)
const isOrphaned = (commitId: string) => !reachableCommits.value.has(commitId);

const headPos = computed(() => {
  if (!props.state.head) return null;

  // Handle detached HEAD
  if (props.state.head.type === "detached") {
    const c = commitById.value.get(props.state.head.commit);
    if (!c) return null;
    const p = pos(c.x, c.y);
    return { ...p, branch: null, detached: true };
  }

  // Regular branch HEAD
  const b = props.state.branches[props.state.head.name];
  if (!b?.head) return null;
  const c = commitById.value.get(b.head);
  if (!c) return null;
  const p = pos(c.x, c.y);
  return { ...p, branch: b.name, detached: false };
});

// Calculate edge path with smooth bezier curves
const getEdgePath = (commit: Commit, parentId: string, isMergeEdge: boolean) => {
  const parent = commitById.value.get(parentId);
  if (!parent) return "";

  const a = pos(commit.x, commit.y);
  const b = pos(parent.x, parent.y);

  // For merge edges (coming from another branch), use a curved path
  if (isMergeEdge || commit.x !== parent.x) {
    const controlY1 = a.cy - ROW_HEIGHT * 0.4;
    const controlY2 = b.cy + ROW_HEIGHT * 0.4;
    return `M ${a.cx} ${a.cy - NODE_RADIUS}
            C ${a.cx} ${controlY1},
              ${b.cx} ${controlY2},
              ${b.cx} ${b.cy + NODE_RADIUS}`;
  }

  // For straight-line edges (same branch)
  return `M ${a.cx} ${a.cy - NODE_RADIUS} L ${b.cx} ${b.cy + NODE_RADIUS}`;
};

// Check if commit is a merge commit
const isMergeCommit = (commit: Commit) => commit.parents.length > 1;

// Check if commit is HEAD
const isHeadCommit = (commitId: string) => {
  if (!props.state.head) return false;
  if (props.state.head.type === "branch") {
    const b = props.state.branches[props.state.head.name];
    return b?.head === commitId;
  }
  return props.state.head.commit === commitId;
};

// Get commit icon
const getCommitIcon = (commit: Commit) => {
  if (commit.isRebase) return "↻";
  if (commit.isRevert) return "↩";
  if (commit.isCherryPick) return "🍒";
  if (commit.parents.length > 1) return "⚭";
  return "●";
};

// Get animation delay based on commit index
const getCommitDelay = (index: number) => `${index * 0.15}s`;

// Get branches pointing to a specific commit
const getBranchesAtCommit = (commitId: string) => {
  return Object.values(props.state.branches).filter(b => b.head === commitId);
};

// Calculate branch label offset to avoid overlapping
const getBranchOffset = (branchIndex: number) => branchIndex * 28;

// Get tags pointing to a specific commit (advanced mode)
const getTagsAtCommit = (commitId: string) => {
  return (props.state.tags ?? []).filter(t => t.commitId === commitId);
};

// Check if a commit is the bisect current/bad/result
const getBisectStatus = (commitId: string): "bad" | "good" | "current" | null => {
  const bisect = props.state.bisect;
  if (!bisect?.active) return null;
  if (bisect.result === commitId) return "bad";
  if (bisect.current === commitId) return "current";
  if (bisect.bad === commitId) return "bad";
  if (bisect.good?.includes(commitId)) return "good";
  return null;
};
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
        <div class="legend-item" v-if="state.stagingCount > 0">
          <div class="legend-indicator legend-indicator--staging">
            <span class="staging-pulse"></span>
          </div>
          <span><strong>{{ state.stagingCount }}</strong> staged</span>
        </div>
        <div class="legend-item legend-item--branch" v-if="state.activeBranch">
          <div class="legend-indicator legend-indicator--head"></div>
          <span>on <strong>{{ state.activeBranch }}</strong></span>
        </div>
      </div>
    </div>

    <div class="graph__canvas">
      <!-- Empty state -->
      <div v-if="!state.initialized" class="empty-state">
        <div class="empty-visual">
          <div class="empty-node empty-node--1"></div>
          <div class="empty-node empty-node--2"></div>
          <div class="empty-node empty-node--3"></div>
          <div class="empty-line"></div>
        </div>
        <div class="empty-content">
          <h3>No Repository Yet</h3>
          <p>Run <code>git init</code> to create a repository and start visualizing your commits.</p>
        </div>
      </div>

      <!-- Initialized but no commits -->
      <div v-else-if="state.commits.length === 0" class="empty-state">
        <div class="empty-visual">
          <div class="staging-area">
            <div class="staging-icon">📦</div>
            <div class="staging-ring"></div>
          </div>
        </div>
        <div class="empty-content">
          <h3>Ready to Commit</h3>
          <p>
            Stage changes with <code>git add .</code><br />
            Then create your first commit with <code>git commit -m "message"</code>
          </p>
        </div>
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
          <!-- Gradient for commit edges -->
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--color-commit)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--color-commit)" stop-opacity="0.3" />
          </linearGradient>

          <!-- Gradient for merge edges -->
          <linearGradient id="mergeEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="var(--color-merge)" stop-opacity="0.8" />
            <stop offset="100%" stop-color="var(--color-merge)" stop-opacity="0.3" />
          </linearGradient>

          <!-- Commit node gradient -->
          <radialGradient id="commitGradient" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#c4b5fd" />
            <stop offset="100%" stop-color="var(--color-commit)" />
          </radialGradient>

          <!-- Merge commit gradient -->
          <radialGradient id="mergeGradient" cx="30%" cy="30%">
            <stop offset="0%" stop-color="#f9a8d4" />
            <stop offset="100%" stop-color="var(--color-merge)" />
          </radialGradient>

          <!-- HEAD glow filter -->
          <filter id="headGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood flood-color="var(--color-head)" flood-opacity="0.6" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Commit glow filter -->
          <filter id="commitGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood flood-color="var(--color-commit)" flood-opacity="0.4" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <!-- Arrow marker for flow direction -->
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-commit)" opacity="0.5" />
          </marker>
        </defs>

        <!-- Background grid -->
        <g class="grid-layer">
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
          </pattern>
          <pattern id="largeGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)"/>
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#largeGrid)" />
        </g>

        <!-- Lane indicators (vertical lines showing branch paths) -->
        <g class="lane-indicators">
          <g v-for="branch in Object.values(state.branches)" :key="'lane-' + branch.name">
            <line
              v-if="branch.head"
              class="lane-line"
              :x1="PADDING_X + branch.lane * LANE_WIDTH"
              y1="40"
              :x2="PADDING_X + branch.lane * LANE_WIDTH"
              :y2="size.height - 40"
              :style="{
                stroke: branch.name === state.activeBranch ? 'var(--color-head)' : 'rgba(255,255,255,0.06)',
                strokeWidth: branch.name === state.activeBranch ? 2 : 1
              }"
            />
            <!-- Lane label at top -->
            <text
              v-if="branch.head"
              class="lane-label"
              :x="PADDING_X + branch.lane * LANE_WIDTH"
              y="28"
              text-anchor="middle"
              :style="{ fill: branch.name === state.activeBranch ? 'var(--color-head)' : 'var(--text-muted)' }"
            >
              {{ branch.name }}
            </text>
          </g>
        </g>

        <!-- Time flow arrow -->
        <g class="time-indicator">
          <text class="time-label" x="30" :y="PADDING_Y" text-anchor="middle" fill="var(--text-muted)">
            oldest
          </text>
          <line
            class="time-arrow"
            x1="30"
            :y1="PADDING_Y + 20"
            x2="30"
            :y2="size.height - 60"
            stroke="var(--text-muted)"
            stroke-width="1"
            stroke-dasharray="4,4"
            opacity="0.3"
          />
          <text class="time-label" x="30" :y="size.height - 40" text-anchor="middle" fill="var(--text-muted)">
            newest
          </text>
        </g>

        <!-- Edges (connections between commits) -->
        <g class="edges">
          <template v-for="c in state.commits" :key="'edge-' + c.id">
            <template v-for="(pId, pIndex) in c.parents" :key="pId">
            <path
              v-if="commitById.get(pId)"
              class="edge"
              :class="{
                'edge--merge': pIndex > 0,
                'edge--orphaned': isOrphaned(c.id),
                'edge--active': state.activeBranch && state.branches[state.activeBranch]?.lane === c.x
              }"
              :d="getEdgePath(c, pId, pIndex > 0)"
              :stroke="pIndex > 0 ? 'url(#mergeEdgeGradient)' : 'url(#edgeGradient)'"
            />
            </template>
          </template>
        </g>

        <!-- HEAD indicator rings -->
        <g v-if="headPos" class="head-indicator">
          <circle
            class="head-ring head-ring--outer"
            :cx="headPos.cx"
            :cy="headPos.cy"
            :r="NODE_RADIUS + 20"
          />
          <circle
            class="head-ring head-ring--middle"
            :cx="headPos.cx"
            :cy="headPos.cy"
            :r="NODE_RADIUS + 12"
          />
          <circle
            class="head-ring head-ring--inner"
            :cx="headPos.cx"
            :cy="headPos.cy"
            :r="NODE_RADIUS + 6"
          />
        </g>

        <!-- Commit nodes -->
        <g class="commits">
          <g
            v-for="(c, index) in state.commits"
            :key="c.id"
            class="commit"
            :class="{
              'commit--head': isHeadCommit(c.id),
              'commit--orphaned': isOrphaned(c.id),
              'commit--rebase': c.isRebase,
              'commit--revert': c.isRevert,
              'commit--cherry': c.isCherryPick
            }"
            :style="{ '--delay': getCommitDelay(index) }"
          >
            <!-- Outer glow ring -->
            <circle
              class="node-glow"
              :class="{
                'node-glow--merge': isMergeCommit(c),
                'node-glow--rebase': c.isRebase,
                'node-glow--revert': c.isRevert,
                'node-glow--cherry': c.isCherryPick
              }"
              :cx="pos(c.x, c.y).cx"
              :cy="pos(c.x, c.y).cy"
              :r="NODE_RADIUS + 8"
            />

            <!-- Main commit circle -->
            <circle
              class="node"
              :class="{
                'node--merge': isMergeCommit(c),
                'node--head': isHeadCommit(c.id),
                'node--rebase': c.isRebase,
                'node--revert': c.isRevert,
                'node--cherry': c.isCherryPick,
                'node--orphaned': isOrphaned(c.id)
              }"
              :cx="pos(c.x, c.y).cx"
              :cy="pos(c.x, c.y).cy"
              :r="NODE_RADIUS"
              :fill="isMergeCommit(c) ? 'url(#mergeGradient)' : 'url(#commitGradient)'"
              :filter="isHeadCommit(c.id) ? 'url(#headGlow)' : ''"
            />

            <!-- Inner highlight -->
            <circle
              class="node-highlight"
              :cx="pos(c.x, c.y).cx - 6"
              :cy="pos(c.x, c.y).cy - 6"
              r="6"
            />

            <!-- Commit type icon -->
            <text
              class="node-icon"
              :x="pos(c.x, c.y).cx"
              :y="pos(c.x, c.y).cy + 5"
              text-anchor="middle"
            >
              {{ getCommitIcon(c) }}
            </text>

            <!-- Special commit type badge -->
            <g v-if="c.isRebase || c.isRevert || c.isCherryPick" class="commit-type-badge">
              <rect
                class="type-badge-bg"
                :class="{
                  'type-badge-bg--rebase': c.isRebase,
                  'type-badge-bg--revert': c.isRevert,
                  'type-badge-bg--cherry': c.isCherryPick
                }"
                :x="pos(c.x, c.y).cx + NODE_RADIUS - 8"
                :y="pos(c.x, c.y).cy - NODE_RADIUS - 8"
                width="20"
                height="20"
                rx="10"
              />
              <text
                class="type-badge-icon"
                :x="pos(c.x, c.y).cx + NODE_RADIUS + 2"
                :y="pos(c.x, c.y).cy - NODE_RADIUS + 6"
                text-anchor="middle"
              >
                {{ c.isRebase ? '↻' : c.isRevert ? '↩' : '🍒' }}
              </text>
            </g>

            <!-- Orphaned indicator -->
            <g v-if="isOrphaned(c.id)" class="orphaned-badge">
              <rect
                class="orphaned-badge-bg"
                :x="pos(c.x, c.y).cx - NODE_RADIUS - 28"
                :y="pos(c.x, c.y).cy - 10"
                width="22"
                height="20"
                rx="4"
              />
              <text
                class="orphaned-icon"
                :x="pos(c.x, c.y).cx - NODE_RADIUS - 17"
                :y="pos(c.x, c.y).cy + 4"
                text-anchor="middle"
              >
                👻
              </text>
            </g>

            <!-- Commit message label -->
            <g class="commit-label">
              <rect
                class="commit-label-bg"
                :x="pos(c.x, c.y).cx + NODE_RADIUS + 12"
                :y="pos(c.x, c.y).cy - 12"
                :width="Math.min(c.message.length * 8 + 16, 180)"
                height="24"
                rx="6"
              />
              <text
                class="commit-message"
                :x="pos(c.x, c.y).cx + NODE_RADIUS + 20"
                :y="pos(c.x, c.y).cy + 4"
              >
                {{ c.message.length > 20 ? c.message.slice(0, 18) + '...' : c.message }}
              </text>
            </g>

            <!-- Commit ID badge -->
            <g class="commit-id-badge">
              <rect
                class="id-badge-bg"
                :x="pos(c.x, c.y).cx - 28"
                :y="pos(c.x, c.y).cy - NODE_RADIUS - 24"
                width="56"
                height="18"
                rx="9"
              />
              <text
                class="commit-id"
                :x="pos(c.x, c.y).cx"
                :y="pos(c.x, c.y).cy - NODE_RADIUS - 11"
                text-anchor="middle"
              >
                {{ c.id }}
              </text>
            </g>
          </g>
        </g>

        <!-- Branch pointers -->
        <g class="branch-pointers">
          <g v-for="c in state.commits" :key="'branch-ptr-' + c.id">
            <g
              v-for="(branch, bIndex) in getBranchesAtCommit(c.id)"
              :key="branch.name"
              class="branch-pointer"
              :class="{ 'branch-pointer--active': branch.name === state.activeBranch }"
            >
              <!-- Pointer line -->
              <line
                class="branch-line"
                :x1="pos(c.x, c.y).cx - NODE_RADIUS - 15"
                :y1="pos(c.x, c.y).cy + getBranchOffset(bIndex)"
                :x2="pos(c.x, c.y).cx - NODE_RADIUS - 5"
                :y2="pos(c.x, c.y).cy"
              />

              <!-- Branch tag -->
              <rect
                class="branch-tag"
                :x="pos(c.x, c.y).cx - NODE_RADIUS - 15 - 70"
                :y="pos(c.x, c.y).cy - 11 + getBranchOffset(bIndex)"
                width="68"
                height="22"
                rx="11"
              />
              <text
                class="branch-name"
                :x="pos(c.x, c.y).cx - NODE_RADIUS - 15 - 36"
                :y="pos(c.x, c.y).cy + 4 + getBranchOffset(bIndex)"
                text-anchor="middle"
              >
                {{ branch.name }}
              </text>
            </g>
          </g>
        </g>

        <!-- Tag pointers (advanced mode) -->
        <g class="tag-pointers" v-if="state.tags && state.tags.length > 0">
          <g v-for="c in state.commits" :key="'tag-ptr-' + c.id">
            <g
              v-for="(tag, tIndex) in getTagsAtCommit(c.id)"
              :key="tag.name"
              class="tag-pointer"
            >
              <!-- Tag line (points right of commit) -->
              <line
                class="tag-line"
                :x1="pos(c.x, c.y).cx + NODE_RADIUS + 5"
                :y1="pos(c.x, c.y).cy - 20 - tIndex * 26"
                :x2="pos(c.x, c.y).cx + NODE_RADIUS + 15"
                :y2="pos(c.x, c.y).cy - 20 - tIndex * 26"
              />
              <!-- Tag rectangle -->
              <rect
                class="tag-rect"
                :class="{ 'tag-rect--annotated': tag.isAnnotated }"
                :x="pos(c.x, c.y).cx + NODE_RADIUS + 15"
                :y="pos(c.x, c.y).cy - 31 - tIndex * 26"
                :width="Math.min(tag.name.length * 7.5 + 24, 160)"
                height="22"
                rx="11"
              />
              <text
                class="tag-name"
                :x="pos(c.x, c.y).cx + NODE_RADIUS + 27"
                :y="pos(c.x, c.y).cy - 16 - tIndex * 26"
              >
                🏷 {{ tag.name }}
              </text>
            </g>
          </g>
        </g>

        <!-- Bisect markers -->
        <g class="bisect-markers" v-if="state.bisect && state.bisect.active">
          <g v-for="c in state.commits" :key="'bisect-' + c.id">
            <g v-if="getBisectStatus(c.id)">
              <circle
                class="bisect-ring"
                :class="`bisect-ring--${getBisectStatus(c.id)}`"
                :cx="pos(c.x, c.y).cx"
                :cy="pos(c.x, c.y).cy"
                :r="NODE_RADIUS + 14"
              />
              <text
                class="bisect-label"
                :class="`bisect-label--${getBisectStatus(c.id)}`"
                :x="pos(c.x, c.y).cx"
                :y="pos(c.x, c.y).cy - NODE_RADIUS - 30"
                text-anchor="middle"
              >
                {{ getBisectStatus(c.id) === "current" ? "testing" : getBisectStatus(c.id) }}
              </text>
            </g>
          </g>
        </g>

        <!-- HEAD label -->
        <g v-if="headPos" class="head-label" :class="{ 'head-label--detached': headPos.detached }">
          <rect
            class="head-tag"
            :class="{ 'head-tag--detached': headPos.detached }"
            :x="headPos.cx - 40"
            :y="headPos.cy + NODE_RADIUS + 15"
            :width="headPos.detached ? 90 : 64"
            height="26"
            rx="13"
          />
          <text
            class="head-text"
            :class="{ 'head-text--detached': headPos.detached }"
            :x="headPos.cx + 5"
            :y="headPos.cy + NODE_RADIUS + 33"
            text-anchor="middle"
          >
            {{ headPos.detached ? '⚠️ DETACHED' : 'HEAD' }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Visual Legend -->
    <div class="graph__footer" v-if="state.commits.length > 0">
      <div class="mini-legend">
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--commit"></span>
          <span>Commit</span>
        </div>
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--merge"></span>
          <span>Merge</span>
        </div>
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--rebase"></span>
          <span>Rebase</span>
        </div>
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--revert"></span>
          <span>Revert</span>
        </div>
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--cherry"></span>
          <span>Cherry-pick</span>
        </div>
        <div class="mini-legend-item">
          <span class="mini-dot mini-dot--orphan"></span>
          <span>Orphaned</span>
        </div>
        <div class="mini-legend-item" v-if="state.tags && state.tags.length > 0">
          <span class="mini-dot mini-dot--tag"></span>
          <span>Tag</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.graph {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  flex: 1;
  min-height: 450px;
}

.graph__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.graph__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.graph__title svg {
  color: var(--color-commit);
}

.graph__legend {
  display: flex;
  gap: 1.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.legend-item strong {
  color: var(--text-primary);
}

.legend-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.legend-indicator--staging {
  background: var(--color-staging);
}

.staging-pulse {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: var(--color-staging);
  opacity: 0.4;
  animation: stagingPulse 2s ease-in-out infinite;
}

@keyframes stagingPulse {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 0; }
}

.legend-indicator--head {
  background: var(--color-head);
  box-shadow: 0 0 10px var(--color-head);
}

.legend-item--branch {
  padding: 6px 14px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.25);
  border-radius: 999px;
}

/* Tag styles */
.tag-line {
  stroke: #fbbf24;
  stroke-width: 1.5;
  opacity: 0.7;
}

.tag-rect {
  fill: rgba(251, 191, 36, 0.12);
  stroke: rgba(251, 191, 36, 0.5);
  stroke-width: 1;
}

.tag-rect--annotated {
  fill: rgba(251, 191, 36, 0.2);
  stroke: rgba(251, 191, 36, 0.7);
  stroke-width: 1.5;
}

.tag-name {
  font-size: 10px;
  fill: #fbbf24;
  font-weight: 600;
  font-family: 'Inter', monospace;
}

/* Bisect styles */
.bisect-ring {
  fill: none;
  stroke-width: 2.5;
  stroke-dasharray: 5,3;
}

.bisect-ring--bad     { stroke: #f87171; }
.bisect-ring--good    { stroke: #34d399; }
.bisect-ring--current { stroke: #fbbf24; animation: bisectPulse 1.2s ease-in-out infinite; }

@keyframes bisectPulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.bisect-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.bisect-label--bad     { fill: #f87171; }
.bisect-label--good    { fill: #34d399; }
.bisect-label--current { fill: #fbbf24; }

.graph__canvas {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(167, 139, 250, 0.05) 0%, transparent 50%),
    rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  overflow: auto;
  padding: 1.5rem;
  min-height: 380px;
}

/* Empty States */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 3rem;
  text-align: center;
  width: 100%;
  height: 100%;
  min-height: 320px;
}

.empty-visual {
  position: relative;
  width: 160px;
  height: 120px;
}

.empty-node {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-commit);
  opacity: 0.2;
}

.empty-node--1 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  animation: emptyPulse 3s ease-in-out infinite;
}

.empty-node--2 {
  top: 44px;
  left: 20%;
  animation: emptyPulse 3s ease-in-out infinite 0.5s;
}

.empty-node--3 {
  top: 88px;
  left: 70%;
  animation: emptyPulse 3s ease-in-out infinite 1s;
}

.empty-line {
  position: absolute;
  top: 16px;
  left: 50%;
  width: 2px;
  height: 90px;
  background: linear-gradient(to bottom, var(--color-commit), transparent);
  opacity: 0.15;
  transform: translateX(-50%);
}

@keyframes emptyPulse {
  0%, 100% { opacity: 0.15; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.3; transform: translateX(-50%) scale(1.1); }
}

.staging-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.staging-icon {
  font-size: 3rem;
  animation: stagingBounce 2s ease-in-out infinite;
}

@keyframes stagingBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.staging-ring {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-staging);
  border-radius: 50%;
  opacity: 0.3;
  animation: stagingRing 2s ease-out infinite;
}

@keyframes stagingRing {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.empty-content p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0;
  max-width: 360px;
}

.empty-content code {
  padding: 3px 10px;
  background: rgba(167, 139, 250, 0.15);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  color: var(--color-commit);
}

/* SVG Styles */
.svg {
  display: block;
}

/* Lane indicators */
.lane-line {
  stroke-dasharray: 6, 6;
  opacity: 0.5;
}

.lane-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
}

/* Time indicator */
.time-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.5;
}

/* Edges */
.edge {
  fill: none;
  stroke-width: 4;
  stroke-linecap: round;
  opacity: 0;
  animation: edgeAppear 0.8s ease-out forwards;
}

.edge--active {
  stroke-width: 5;
}

.edge--merge {
  stroke-dasharray: 12, 6;
  animation: edgeAppear 0.8s ease-out forwards, dashFlow 15s linear infinite;
}

@keyframes edgeAppear {
  0% {
    opacity: 0;
    stroke-dasharray: 0, 1000;
  }
  100% {
    opacity: 1;
    stroke-dasharray: 1000, 0;
  }
}

@keyframes dashFlow {
  to {
    stroke-dashoffset: -100;
  }
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
  stroke-width: 1;
  opacity: 0.15;
  animation: headRingPulse 2.5s ease-in-out infinite;
}

.head-ring--middle {
  stroke-width: 2;
  opacity: 0.25;
  animation: headRingPulse 2.5s ease-in-out infinite 0.3s;
}

.head-ring--inner {
  stroke-width: 3;
  opacity: 0.4;
  animation: headRingPulse 2.5s ease-in-out infinite 0.6s;
}

@keyframes headRingPulse {
  0%, 100% { opacity: 0.15; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.05); }
}

/* Commit nodes */
.commit {
  animation: commitAppear 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay, 0s) both;
}

@keyframes commitAppear {
  0% {
    opacity: 0;
    transform: scale(0) translateY(20px);
  }
  60% {
    transform: scale(1.15) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
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
  opacity: 0.25;
}

.node {
  stroke: rgba(255, 255, 255, 0.2);
  stroke-width: 2;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), stroke-width 0.3s ease;
}

.node--merge {
  stroke: rgba(244, 114, 182, 0.3);
}

.node--head {
  stroke: var(--color-head);
  stroke-width: 3;
}

.commit:hover .node {
  transform: scale(1.1);
  stroke-width: 3;
}

.node-highlight {
  fill: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.node-icon {
  font-size: 14px;
  fill: rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

/* Commit labels */
.commit-label {
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.commit:hover .commit-label {
  opacity: 1;
}

.commit-label-bg {
  fill: rgba(0, 0, 0, 0.6);
  stroke: var(--border-color);
  stroke-width: 1;
}

.commit-message {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  fill: var(--text-primary);
}

/* Commit ID badge */
.commit-id-badge {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.commit:hover .commit-id-badge {
  opacity: 1;
}

.id-badge-bg {
  fill: rgba(167, 139, 250, 0.2);
  stroke: rgba(167, 139, 250, 0.3);
  stroke-width: 1;
}

.commit-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 600;
  fill: var(--color-commit);
}

/* Branch pointers */
.branch-pointer {
  animation: branchAppear 0.4s ease-out both;
}

@keyframes branchAppear {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.branch-line {
  stroke: var(--color-branch);
  stroke-width: 2;
  opacity: 0.6;
}

.branch-tag {
  fill: var(--color-branch);
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.branch-pointer:hover .branch-tag {
  opacity: 0.35;
}

.branch-pointer--active .branch-tag {
  opacity: 0.35;
  stroke: var(--color-branch);
  stroke-width: 2;
}

.branch-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 600;
  fill: var(--color-branch);
}

/* HEAD label */
.head-label {
  animation: headLabelAppear 0.5s ease-out 0.3s both;
}

@keyframes headLabelAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.head-tag {
  fill: var(--color-head);
  opacity: 0.25;
}

.head-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  fill: var(--color-head);
}

/* Footer legend */
.graph__footer {
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.mini-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.mini-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.mini-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.mini-dot--commit {
  background: var(--color-commit);
}

.mini-dot--merge {
  background: var(--color-merge);
}

.mini-dot--branch {
  background: var(--color-branch);
}

.mini-dot--head {
  background: var(--color-head);
  box-shadow: 0 0 6px var(--color-head);
}

.mini-dot--rebase {
  background: #22d3ee;
}

.mini-dot--revert {
  background: #fb923c;
}

.mini-dot--cherry {
  background: #f43f5e;
}

.mini-dot--orphan {
  background: #6b7280;
  opacity: 0.5;
}

.mini-dot--tag {
  background: #fbbf24;
  box-shadow: 0 0 6px rgba(251, 191, 36, 0.5);
}

/* Special commit type styles */
.commit--orphaned {
  opacity: 0.4;
}

.commit--orphaned .node {
  stroke-dasharray: 4, 2;
}

.node--rebase {
  stroke: #22d3ee !important;
  stroke-width: 3;
}

.node--revert {
  stroke: #fb923c !important;
  stroke-width: 3;
}

.node--cherry {
  stroke: #f43f5e !important;
  stroke-width: 3;
}

.node--orphaned {
  opacity: 0.5;
  stroke-dasharray: 4, 2;
}

.node-glow--rebase {
  fill: #22d3ee;
}

.node-glow--revert {
  fill: #fb923c;
}

.node-glow--cherry {
  fill: #f43f5e;
}

.edge--orphaned {
  opacity: 0.2;
  stroke-dasharray: 4, 4;
}

/* Type badge */
.commit-type-badge {
  animation: badgePop 0.3s ease-out;
}

@keyframes badgePop {
  0% { transform: scale(0); }
  70% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.type-badge-bg {
  fill: var(--color-commit);
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 1;
}

.type-badge-bg--rebase {
  fill: #22d3ee;
}

.type-badge-bg--revert {
  fill: #fb923c;
}

.type-badge-bg--cherry {
  fill: #f43f5e;
}

.type-badge-icon {
  font-size: 10px;
  fill: white;
}

/* Orphaned badge */
.orphaned-badge {
  animation: fadeIn 0.5s ease-out;
}

.orphaned-badge-bg {
  fill: rgba(107, 114, 128, 0.3);
  stroke: rgba(107, 114, 128, 0.5);
  stroke-width: 1;
}

.orphaned-icon {
  font-size: 12px;
}

/* Detached HEAD styles */
.head-tag--detached {
  fill: #ef4444;
  animation: detachedPulse 1.5s ease-in-out infinite;
}

@keyframes detachedPulse {
  0%, 100% { opacity: 0.25; }
  50% { opacity: 0.5; }
}

.head-text--detached {
  fill: #ef4444;
  font-size: 10px;
}

.head-label--detached .head-ring {
  stroke: #ef4444;
}
</style>
