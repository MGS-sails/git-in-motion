<script setup lang="ts">
import { ref, computed } from "vue";

interface SlideDemo {
  label: string;
  icon?: string;
  commands: string[];
  resetFirst?: boolean;
  primary?: boolean;
}

interface Slide {
  icon: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  diagram?: string;
  commandBlock?: string;
  bullets?: string[];
  tip?: string;
  warning?: string;
  demos: SlideDemo[];
}

const props = defineProps<{
  onRunCommand: (cmd: string) => void;
  onResetState: () => void;
}>();

const emit = defineEmits<{ close: [] }>();

const currentSlide = defineModel<number>("slide", { default: 0 });
const isRunning = ref(false);

const slides: Slide[] = [
  // ─── Slide 1: Title ──────────────────────────────────────────────────────────
  {
    icon: "🧠",
    title: "Git Rebase",
    subtitle: "Clean History Without Losing Your Mind",
    paragraphs: [
      "Rebase is one of Git's most powerful features. It **rewrites commit history** to create a clean, linear timeline — as if you started your work from the latest version of main.",
      "This guide walks through every key concept with **live demos in the graph above**. Click the demo buttons on each slide to see rebase in action.",
    ],
    bullets: [
      "What rebase is and how it actually works",
      "Merge vs Rebase side-by-side comparison",
      "Handling conflicts during a rebase",
      "Interactive rebase for polishing commits",
      "The Golden Rule: when NOT to rebase",
    ],
    demos: [],
  },

  // ─── Slide 2: The Problem ─────────────────────────────────────────────────────
  {
    icon: "⚠️",
    title: "The Problem",
    subtitle: "Why do we even need rebase?",
    paragraphs: [
      "When you work on a feature branch, **main keeps moving forward**. Your branch drifts further and further away from the latest changes.",
    ],
    diagram: `A---B---C  ← main (has moved ahead)
     \\
      D---E  ← feature (drifting away!)`,
    bullets: [
      "Messy, non-linear commit history",
      "Hard-to-read Pull Requests",
      "Integration gets harder the longer you wait",
    ],
    demos: [
      {
        label: "Create Diverged Branches",
        icon: "🌿",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial setup"',
          "git add .",
          'git commit -m "B: Add data files"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: Feature work"',
          "git add .",
          'git commit -m "E: More feature work"',
          "git switch main",
          "git add .",
          'git commit -m "C: Update main"',
          "git switch feature",
        ],
      },
    ],
  },

  // ─── Slide 3: Merge vs Rebase ─────────────────────────────────────────────────
  {
    icon: "🔄",
    title: "Merge vs Rebase",
    subtitle: "Two ways to integrate changes",
    paragraphs: [
      "Both commands integrate changes from one branch into another — but they produce very different histories.",
    ],
    diagram: `After Merge:
A---B---C-------M  ← main
     \\         /
      D---E---'  (merge commit M has 2 parents)

After Rebase:
A---B---C---D'---E'  ← feature (clean linear history!)`,
    bullets: [
      "**Merge** preserves history exactly as it happened (with a merge commit)",
      "**Rebase** rewrites history to look linear (no merge commit needed)",
    ],
    demos: [
      {
        label: "Show After Merge",
        icon: "🔀",
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial setup"',
          "git add .",
          'git commit -m "B: Add data files"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: Feature work"',
          "git add .",
          'git commit -m "E: More feature work"',
          "git switch main",
          "git add .",
          'git commit -m "C: Update main"',
          "git merge feature",
        ],
      },
      {
        label: "Show After Rebase",
        icon: "🔄",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial setup"',
          "git add .",
          'git commit -m "B: Add data files"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: Feature work"',
          "git add .",
          'git commit -m "E: More feature work"',
          "git switch main",
          "git add .",
          'git commit -m "C: Update main"',
          "git switch feature",
          "git rebase main",
        ],
      },
    ],
  },

  // ─── Slide 4: What Rebase Does ────────────────────────────────────────────────
  {
    icon: "🧩",
    title: "What Rebase Actually Does",
    subtitle: "Replay your commits on top of another branch",
    paragraphs: [
      "Rebase doesn't move your commits — it **creates brand new copies** and places them on top of the target branch. The originals become orphaned.",
    ],
    bullets: [
      "1. Find the **common ancestor** of both branches",
      "2. Temporarily set aside your commits (D, E)",
      "3. Move your branch pointer to the target tip (C)",
      "4. **Reapply commits one by one** as new commits (D', E')",
    ],
    tip: "Notice the faded commits after rebasing — those are the originals. D' and E' have the same changes but NEW commit hashes. History has been rewritten!",
    demos: [
      {
        label: "Watch Rebase in Action",
        icon: "👁️",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial"',
          "git add .",
          'git commit -m "B: Base"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: My feature"',
          "git add .",
          'git commit -m "E: More changes"',
          "git switch main",
          "git add .",
          'git commit -m "C: Main update"',
          "git switch feature",
          "git rebase main",
        ],
      },
    ],
  },

  // ─── Slide 5: Basic Command ───────────────────────────────────────────────────
  {
    icon: "⚙️",
    title: "Basic Rebase Command",
    subtitle: "The syntax is simple",
    paragraphs: [
      "To rebase your feature branch onto main, switch to the feature branch first, then run `git rebase main`:",
    ],
    commandBlock: `# Switch to your feature branch first
git checkout feature

# Then rebase onto main
git rebase main`,
    bullets: [
      `"Take all commits on **feature** that aren't on **main**"`,
      `"Replay them on top of main's latest commit"`,
      `"Move the feature pointer to the new tip"`,
    ],
    tip: "You can also rebase onto a specific commit hash: `git rebase <hash>`. Useful for rebasing onto an older point in history.",
    demos: [
      {
        label: "Run Setup + Rebase",
        icon: "▶️",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Setup"',
          "git add .",
          'git commit -m "B: Base commit"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "My feature commit"',
          "git switch main",
          "git add .",
          'git commit -m "C: Main moved forward"',
          "git switch feature",
          "git rebase main",
        ],
      },
    ],
  },

  // ─── Slide 6: Live Demo ───────────────────────────────────────────────────────
  {
    icon: "🔥",
    title: "Live Demo",
    subtitle: "Watch what happens to commit history",
    paragraphs: [
      "This is the full rebase workflow. Watch the graph closely — notice the orphaned (faded) commits after the rebase.",
    ],
    bullets: [
      "Feature branch starts from B, **not the latest main**",
      "Main gets a new commit C after feature branched",
      "After rebase: feature commits appear **after** C",
      "Old D and E become **orphaned** (shown faded)",
      "New D' and E' have the same changes but **different hashes**",
    ],
    demos: [
      {
        label: "▶ Run Full Demo",
        icon: "🚀",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial setup"',
          "git add .",
          'git commit -m "B: Second commit"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: Feature commit 1"',
          "git add .",
          'git commit -m "E: Feature commit 2"',
          "git switch main",
          "git add .",
          'git commit -m "C: New work on main"',
          "git switch feature",
          "git rebase main",
        ],
      },
    ],
  },

  // ─── Slide 7: Conflicts ───────────────────────────────────────────────────────
  {
    icon: "⚠️",
    title: "Conflicts During Rebase",
    subtitle: "What to do when rebase stops mid-way",
    paragraphs: [
      "When replaying a commit would create a conflict, rebase **pauses** and asks you to fix it manually. This is normal — don't panic!",
    ],
    commandBlock: `CONFLICT (content): Merge conflict in notes.txt

# 1. Fix the conflict in the File Viewer
# 2. Stage the resolved file:
git add .

# 3. Continue the rebase:
git rebase --continue`,
    bullets: [
      "Rebase stops at the conflicting commit",
      "Fix the conflict in the **File Viewer** panel",
      "Stage resolved files: `git add .`",
      "Continue: `git rebase --continue`",
      "Or abandon everything: `git rebase --abort`",
    ],
    tip: "Unlike a single merge conflict, you may need to resolve conflicts multiple times — once per replayed commit that conflicts.",
    demos: [
      {
        label: "Set Up Diverged Branches",
        icon: "🌿",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial"',
          "git add .",
          'git commit -m "B: Base"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "D: Feature"',
          "git switch main",
          "git add .",
          'git commit -m "C: Main"',
          "git switch feature",
        ],
      },
    ],
  },

  // ─── Slide 8: Escape Hatch ────────────────────────────────────────────────────
  {
    icon: "🧯",
    title: "The Escape Hatch",
    subtitle: "You can always bail out",
    paragraphs: [
      "Made a mistake? Rebase going sideways? You can **abort at any time** and return to exactly where you started.",
    ],
    commandBlock: `# Abort the rebase — returns to state before rebase started
git rebase --abort`,
    bullets: [
      "Stops the rebase at any point (mid-conflict is fine)",
      "Restores the branch to its **original state**",
      "Nothing is lost — as if you never started",
      "Always safe to use",
    ],
    warning: "Always mention --abort to your audience first. Knowing the escape hatch exists dramatically reduces rebase anxiety!",
    demos: [
      {
        label: "Setup Branches for Practice",
        icon: "🌿",
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "A: Initial"',
          "git add .",
          'git commit -m "B: Base"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "My feature"',
          "git switch main",
          "git add .",
          'git commit -m "Main updated"',
          "git switch feature",
        ],
      },
    ],
  },

  // ─── Slide 9: Golden Rule ─────────────────────────────────────────────────────
  {
    icon: "🧠",
    title: "The Golden Rule",
    subtitle: "The single most important thing to remember",
    paragraphs: [
      "Rebase **rewrites commit history** — it creates new commits with different hashes. If someone else has the old commits, their history will diverge from yours and Git will refuse to push.",
    ],
    warning: "Never rebase a branch that other people are working on! This breaks everyone's local copy and forces painful conflict resolution.",
    bullets: [
      "❌ Never rebase **main** (or any shared branch)",
      "❌ Never rebase a branch others have **pulled or cloned**",
      "✅ Safe: rebase your own **private feature branches**",
      "✅ Safe: rebase **before opening a Pull Request**",
    ],
    tip: "Rule of thumb: if you're unsure whether others have the branch, use merge instead. It's always safe.",
    demos: [],
  },

  // ─── Slide 10: Why Teams Love It ─────────────────────────────────────────────
  {
    icon: "🧼",
    title: "Why Teams Love Rebase",
    subtitle: "The benefits of a clean linear history",
    paragraphs: [
      "A well-maintained git history with rebase makes the whole team more productive.",
    ],
    bullets: [
      "📖 **Cleaner commit history** — easy to read and navigate",
      "📏 **Linear timeline** — no confusing merge commit tangles",
      "🔍 **Easier debugging** — `git bisect` works far better on linear history",
      "📋 **Cleaner Pull Requests** — reviewers see only the relevant changes",
      "⏪ **Easier rollbacks** — reverting specific commits is straightforward",
    ],
    tip: "Senior engineers typically rebase feature branches before creating a PR. It makes code review significantly more pleasant for everyone.",
    demos: [
      {
        label: "Show Clean Linear History",
        icon: "📏",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "Initial setup"',
          "git add .",
          'git commit -m "Add core features"',
          "git branch feature",
          "git switch feature",
          "git add .",
          'git commit -m "New analysis method"',
          "git add .",
          'git commit -m "Validate results"',
          "git switch main",
          "git add .",
          'git commit -m "Fix edge case in core"',
          "git switch feature",
          "git rebase main",
        ],
      },
    ],
  },

  // ─── Slide 11: Interactive Rebase ────────────────────────────────────────────
  {
    icon: "✏️",
    title: "Interactive Rebase",
    subtitle: "The power move: rewrite your own commits",
    paragraphs: [
      "Interactive rebase lets you **edit, reorder, squash, and drop** commits before sharing them. It's how you turn messy work-in-progress commits into clean professional history.",
    ],
    commandBlock: `# Interactively rebase the last 3 commits
git rebase -i HEAD~3`,
    bullets: [
      "**pick** — keep the commit as-is",
      "**squash** — fold into the previous commit (combines messages)",
      "**drop** — remove the commit entirely",
      "**reword** — change the commit message",
    ],
    tip: "The interactive rebase panel will open above the terminal. Try squashing all commits into one with a clean message!",
    demos: [
      {
        label: "Open Interactive Rebase (4 commits)",
        icon: "✏️",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "Fix bug"',
          "git add .",
          'git commit -m "Fix typo"',
          "git add .",
          'git commit -m "Fix typo again"',
          "git add .",
          'git commit -m "Final fix"',
          "git rebase -i HEAD~4",
        ],
      },
    ],
  },

  // ─── Slide 12: Before vs After ───────────────────────────────────────────────
  {
    icon: "🧪",
    title: "Before vs After Squashing",
    subtitle: "What interactive rebase achieves",
    paragraphs: [
      "This is the transformation that interactive rebase makes possible:",
    ],
    diagram: `Before (messy WIP commits):
● Final fix
● Fix typo again
● Fix typo
● Fix bug

After squashing all into one:
● Fix bug properly ✨`,
    bullets: [
      "The 4 messy commits become **1 clean commit**",
      "All the changes are **preserved** in the squashed commit",
      "Only the **commit history is rewritten**",
      "This is what professional engineers do before a PR",
    ],
    tip: "You can also reorder commits, edit messages, or split a large commit into smaller focused ones — all with git rebase -i.",
    demos: [
      {
        label: "Create Messy Commits to Squash",
        icon: "📝",
        primary: true,
        resetFirst: true,
        commands: [
          "git init",
          "git add .",
          'git commit -m "Fix bug"',
          "git add .",
          'git commit -m "Fix typo"',
          "git add .",
          'git commit -m "Fix typo again"',
          "git add .",
          'git commit -m "Final fix"',
          "git rebase -i HEAD~4",
        ],
      },
    ],
  },

  // ─── Slide 13: When to Use ────────────────────────────────────────────────────
  {
    icon: "⚖️",
    title: "Rebase vs Merge: When to Use Each",
    subtitle: "A practical decision guide",
    paragraphs: [
      "Both tools have their place. Here's when to reach for each:",
    ],
    bullets: [
      "**Use Rebase when:**",
      "→ Working alone on a private feature branch",
      "→ Preparing a Pull Request (clean it up first)",
      "→ Cleaning up messy WIP commits before sharing",
      "**Use Merge when:**",
      "→ Integrating work from shared branches",
      "→ Preserving the exact history of collaboration",
      "→ Merging a PR into main/master",
    ],
    tip: "Many teams use: 'rebase onto main before PR, then merge PR into main'. Clean feature history + clear integration point.",
    demos: [],
  },

  // ─── Slide 14: Mental Model ───────────────────────────────────────────────────
  {
    icon: "🧠",
    title: "The Mental Model",
    subtitle: "The simplest way to remember the difference",
    paragraphs: [
      "When you can't remember which to use, fall back on this:",
    ],
    diagram: `Rebase = "Pretend I started my work from the latest main"
(rewrite history to look cleaner)

Merge  = "Combine our histories as they actually happened"
(preserve the true record of events)`,
    bullets: [
      "Rebase = **time travel** (pretend you worked later, from a better starting point)",
      "Merge = **honest record** (show what actually happened chronologically)",
      "Both result in the **same final code**",
      "The difference is only in the **history they create**",
    ],
    demos: [],
  },

  // ─── Slide 15: Common Mistakes ────────────────────────────────────────────────
  {
    icon: "💥",
    title: "Common Mistakes",
    subtitle: "What to avoid",
    paragraphs: [
      "Most rebase problems come from a handful of common mistakes. Learn to recognise them early:",
    ],
    bullets: [
      "❌ **Rebasing main** — never rebase a shared branch",
      "❌ **Rebasing after pushing** — requires `git push --force` and breaks teammates",
      "❌ **Panicking during conflicts** — they're completely normal, just fix and continue",
      "❌ **Forgetting --abort** — you can always bail out and start fresh",
      "❌ **Squashing too eagerly** — keep commits that are logically distinct",
    ],
    warning: "If you've already pushed and need to rebase, use `git push --force-with-lease` (safer than --force) and warn your team first!",
    demos: [],
  },

  // ─── Slide 16: Exercise ───────────────────────────────────────────────────────
  {
    icon: "🧪",
    title: "Hands-On Exercise",
    subtitle: "Put it all together in the terminal",
    paragraphs: [
      "Now try it yourself! Use the terminal on the left to run through the full rebase workflow:",
    ],
    commandBlock: `# 1. Set up a repository with history
git init
git add . && git commit -m "Initial commit"
git add . && git commit -m "Second commit"

# 2. Create a feature branch
git branch feature
git switch feature
git add . && git commit -m "Feature: part 1"
git add . && git commit -m "Feature: part 2"
git add . && git commit -m "Feature: part 3"

# 3. Advance main independently
git switch main
git add . && git commit -m "Main: hotfix"

# 4. Rebase feature onto main
git switch feature
git rebase main

# 5. Clean up with interactive rebase
git rebase -i HEAD~3`,
    tip: "Run commands one at a time and watch the graph update at each step. That visual feedback is what makes it 'click'!",
    demos: [
      {
        label: "Reset for Fresh Start",
        icon: "🔄",
        primary: true,
        resetFirst: true,
        commands: ["git init"],
      },
    ],
  },
];

const slide = computed(() => slides[currentSlide.value]!);
const progressPct = computed(() =>
  Math.round(((currentSlide.value + 1) / slides.length) * 100)
);

function prevSlide() {
  if (currentSlide.value > 0) currentSlide.value--;
}

function nextSlide() {
  if (currentSlide.value < slides.length - 1) currentSlide.value++;
}

async function runDemo(demo: SlideDemo) {
  if (isRunning.value) return;
  isRunning.value = true;
  try {
    if (demo.resetFirst) {
      props.onResetState();
      await sleep(200);
    }
    for (const cmd of demo.commands) {
      props.onRunCommand(cmd);
      await sleep(380);
    }
  } finally {
    isRunning.value = false;
  }
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// Render **bold** and `code` in text safely (content is author-controlled)
function fmt(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
</script>

<template>
  <Teleport to="body">
    <!-- Clickable scrim on the left lets users interact with graph -->
    <div class="demo-scrim" @click="emit('close')" />

    <div class="demo-drawer">
      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="demo-header">
        <div class="demo-header__left">
          <span class="demo-badge">🔄 Rebase Guide</span>
        </div>
        <div class="demo-header__right">
          <span class="demo-counter">{{ currentSlide + 1 }} / {{ slides.length }}</span>
          <button class="btn-close" @click="emit('close')" title="Close guide">✕</button>
        </div>
      </div>

      <!-- ── Slide body ─────────────────────────────────────────────────── -->
      <div class="demo-body">
        <div class="slide-top">
          <span class="slide-icon">{{ slide.icon }}</span>
          <div>
            <h2 class="slide-title">{{ slide.title }}</h2>
            <p v-if="slide.subtitle" class="slide-subtitle">{{ slide.subtitle }}</p>
          </div>
        </div>

        <div class="slide-content">
          <p
            v-for="(p, i) in slide.paragraphs"
            :key="'p' + i"
            class="slide-para"
            v-html="fmt(p)"
          />

          <pre v-if="slide.diagram" class="slide-diagram">{{ slide.diagram }}</pre>

          <pre v-if="slide.commandBlock" class="slide-code"><code>{{ slide.commandBlock }}</code></pre>

          <ul v-if="slide.bullets?.length" class="slide-bullets">
            <li
              v-for="(b, i) in slide.bullets"
              :key="'b' + i"
              v-html="fmt(b)"
            />
          </ul>

          <div v-if="slide.tip" class="slide-tip">
            <span>💡</span>
            <span v-html="fmt(slide.tip)" />
          </div>

          <div v-if="slide.warning" class="slide-warning">
            <span>⚠️</span>
            <span v-html="fmt(slide.warning)" />
          </div>

          <div v-if="slide.demos.length" class="slide-demos">
            <button
              v-for="demo in slide.demos"
              :key="demo.label"
              :class="['btn-demo', { 'btn-demo--primary': demo.primary }]"
              :disabled="isRunning"
              @click="runDemo(demo)"
            >
              <span v-if="isRunning" class="spin">⏳</span>
              <span v-else-if="demo.icon">{{ demo.icon }}</span>
              {{ isRunning ? "Running…" : demo.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- ── Footer nav ─────────────────────────────────────────────────── -->
      <div class="demo-footer">
        <button
          class="btn-nav"
          :disabled="currentSlide === 0"
          @click="prevSlide"
        >← Prev</button>

        <div class="demo-progress">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct + '%' }" />
          </div>
          <span class="progress-label">{{ currentSlide + 1 }}&thinsp;/&thinsp;{{ slides.length }}</span>
        </div>

        <button
          class="btn-nav btn-nav--next"
          :disabled="currentSlide === slides.length - 1"
          @click="nextSlide"
        >Next →</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* ── Overlay & drawer ───────────────────────────────────────────────────────── */
.demo-scrim {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  z-index: 800;
  cursor: pointer;
}

.demo-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 460px;
  max-width: 95vw;
  z-index: 801;
  background: var(--bg-secondary);
  border-left: 1px solid var(--border-glow);
  box-shadow: -8px 0 40px rgba(0, 0, 0, 0.5), -1px 0 0 rgba(167, 139, 250, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.demo-header__left,
.demo-header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-badge {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-commit);
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
}

.demo-counter {
  font-size: 0.82rem;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

.btn-close {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border-color);
}

.btn-close:hover {
  color: var(--text-primary);
  border-color: rgba(244, 114, 182, 0.4);
  background: rgba(244, 114, 182, 0.1);
}

/* ── Body ───────────────────────────────────────────────────────────────────── */
.demo-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slide-top {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
}

.slide-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
  margin-top: 0.15rem;
}

.slide-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.2rem 0;
  background: linear-gradient(135deg, var(--color-commit), var(--color-branch));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.slide-subtitle {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
}

/* ── Slide content ──────────────────────────────────────────────────────────── */
.slide-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.slide-para {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

.slide-para :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.slide-para :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.83em;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 4px;
  padding: 0.1em 0.4em;
  color: var(--color-commit);
}

.slide-diagram {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--color-branch);
  background: rgba(52, 211, 153, 0.06);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}

.slide-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  line-height: 1.7;
  color: var(--text-primary);
  background: rgba(15, 10, 30, 0.8);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin: 0;
  white-space: pre;
  overflow-x: auto;
}

.slide-code code {
  font-family: inherit;
}

.slide-bullets {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.slide-bullets li {
  font-size: 0.88rem;
  color: var(--text-secondary);
  padding-left: 1.1rem;
  position: relative;
  line-height: 1.55;
}

.slide-bullets li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--color-commit);
}

/* Bullets starting with → have no dot */
.slide-bullets li[v-html*="→"]::before,
.slide-bullets li:has(> :first-child)::before {
  display: none;
}

.slide-bullets li :deep(strong) {
  color: var(--text-primary);
  font-weight: 600;
}

.slide-bullets li :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8em;
  background: rgba(167, 139, 250, 0.1);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  color: var(--color-commit);
}

.slide-tip {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem 0.9rem;
  background: rgba(251, 191, 36, 0.07);
  border: 1px solid rgba(251, 191, 36, 0.2);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.slide-tip :deep(strong) { color: var(--color-head); }
.slide-tip :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82em;
  background: rgba(251, 191, 36, 0.12);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  color: var(--color-head);
}

.slide-warning {
  display: flex;
  gap: 0.6rem;
  align-items: flex-start;
  padding: 0.75rem 0.9rem;
  background: rgba(244, 114, 182, 0.07);
  border: 1px solid rgba(244, 114, 182, 0.25);
  border-radius: 10px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.slide-warning :deep(strong) { color: #f472b6; }
.slide-warning :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82em;
  background: rgba(244, 114, 182, 0.1);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  color: #f472b6;
}

/* ── Demo buttons ───────────────────────────────────────────────────────────── */
.slide-demos {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.25rem;
}

.btn-demo {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-demo:hover:not(:disabled) {
  border-color: rgba(167, 139, 250, 0.4);
  background: rgba(167, 139, 250, 0.1);
  transform: translateY(-1px);
}

.btn-demo--primary {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(52, 211, 153, 0.15));
  border-color: rgba(167, 139, 250, 0.35);
  color: var(--color-commit);
}

.btn-demo--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.3), rgba(52, 211, 153, 0.2));
  border-color: rgba(167, 139, 250, 0.55);
  box-shadow: 0 4px 16px rgba(167, 139, 250, 0.25);
}

.btn-demo:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Footer ─────────────────────────────────────────────────────────────────── */
.demo-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.9rem 1.25rem;
  border-top: 1px solid var(--border-color);
}

.btn-nav {
  padding: 0.45rem 0.9rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-glass);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-nav:hover:not(:disabled) {
  border-color: var(--border-glow);
  color: var(--text-primary);
}

.btn-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-nav--next:not(:disabled) {
  color: var(--color-commit);
  border-color: rgba(167, 139, 250, 0.3);
}

.demo-progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.progress-track {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-commit), var(--color-branch));
  border-radius: 2px;
  transition: width 0.35s ease;
}

.progress-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}

</style>
