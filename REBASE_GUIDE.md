# Rebase Guide — Feature Documentation

The Rebase Guide is an interactive 16-slide walkthrough of git rebase, built into Git in Motion. It is designed for both self-study and live presentations. Each slide pairs a concept from the rebase lecture with a live demo that animates directly in the commit graph.

---

## Opening the Guide

1. Make sure you are **not** in an active tutorial (exit any tutorial first).
2. Click the **"🔄 Rebase Guide"** button in the top-right header, next to "Start Learning".
3. A panel slides in from the right side of the screen.
4. The rest of the app (terminal, graph) remains fully interactive behind the panel.

To close the guide, click **✕** in the top-right of the panel, or click anywhere on the dimmed area to the left of it.

---

## Navigating Slides

| Action | How |
|--------|-----|
| Go to next slide | Click **Next →** in the footer |
| Go to previous slide | Click **← Prev** in the footer |
| See current position | Progress bar + counter in the footer (e.g. `3 / 16`) |

---

## Running Demos

Most slides have one or more **demo buttons** (labelled with an icon and description). When you click a demo button:

1. The graph resets (if the demo needs a clean state).
2. Git commands run automatically, one at a time, with a short pause between each.
3. You can watch the commit graph animate in real time behind the panel.
4. The terminal on the left logs every command that was run.

> **Tip:** After a demo finishes, slide the panel aside (click the scrim) to inspect the graph up close, then reopen the guide to continue.

---

## Slide-by-Slide Reference

### Slide 1 — Git Rebase (Title)
Overview of what the guide covers. No demo.

**Key points:** What rebase is, why it matters, when NOT to use it.

---

### Slide 2 — The Problem
Shows why rebase is needed: feature branches drifting from main.

**Demo — "Create Diverged Branches"**
Runs a full setup sequence:
```
git init  →  2 commits on main  →  branch feature  →  2 commits on feature
→  1 more commit on main  →  switch back to feature
```
After the demo, the graph shows `main` and `feature` branching from a common ancestor — exactly the problem rebase solves.

---

### Slide 3 — Merge vs Rebase
Side-by-side comparison of what each command produces.

**Demo — "Show After Merge"**
Sets up the diverged branches, then runs `git merge feature`. The graph shows a **merge commit (M)** with two parents.

**Demo — "Show After Rebase"**
Sets up the diverged branches, then runs `git rebase main`. The graph shows `feature`'s commits **replayed on top of main** in a straight line. The original commits appear faded (orphaned).

---

### Slide 4 — What Rebase Actually Does
Step-by-step explanation of how rebase works internally.

**Demo — "Watch Rebase in Action"**
Same as the Merge vs Rebase → Rebase demo, but with focus on observing the before and after states.

---

### Slide 5 — Basic Command
The exact syntax for rebasing a feature branch onto main.

**Demo — "Run Setup + Rebase"**
Creates a simple diverged scenario and runs `git rebase main`.

---

### Slide 6 — Live Demo
The complete demo sequence, intended for showing to an audience.

**Demo — "▶ Run Full Demo"**
Runs the full workflow:
```
init → 2 commits on main → branch feature → 2 commits on feature
→ 1 commit on main → switch to feature → git rebase main
```
Watch the graph before and after `git rebase main` runs.

---

### Slide 7 — Conflicts During Rebase
What happens when rebase pauses mid-way due to a conflict.

**Demo — "Set Up Diverged Branches"**
Prepares a state with diverged branches so you can manually run `git rebase main` and observe the output. The slide explains the fix-and-continue workflow:
```
git add .
git rebase --continue
```

---

### Slide 8 — The Escape Hatch
How to abort a rebase at any point.

**Demo — "Setup Branches for Practice"**
Creates diverged branches ready for you to manually run `git rebase main` and then `git rebase --abort` to observe the abort restoring the original state.

---

### Slide 9 — The Golden Rule
**No demo.** This slide explains the most important rebase rule:

> Never rebase a branch other people are working on.

Covers: what to never do, what is safe, and why breaking this rule causes problems.

---

### Slide 10 — Why Teams Love Rebase
**Demo — "Show Clean Linear History"**
Creates a feature branch, adds commits on both branches, then rebases. Demonstrates the clean linear graph that results.

---

### Slide 11 — Interactive Rebase
How to use `git rebase -i` to squash, reorder, drop, and reword commits.

**Demo — "Open Interactive Rebase (4 commits)"**
Creates 4 messy commits:
```
"Fix bug" → "Fix typo" → "Fix typo again" → "Final fix"
```
Then runs `git rebase -i HEAD~4`, which opens the **Interactive Rebase panel** at the top of the screen. Use the dropdowns in the panel to change actions (e.g. squash the last 3 into the first), then click **Execute**.

---

### Slide 12 — Before vs After Squashing
Visual comparison of messy commits vs a single clean commit after squashing.

**Demo — "Create Messy Commits to Squash"**
Same as Slide 11 — creates 4 commits and opens the interactive rebase panel so you can squash them live.

---

### Slide 13 — Rebase vs Merge: When to Use Each
**No demo.** Decision guide:

| Use Rebase | Use Merge |
|------------|-----------|
| On your own feature branch | Integrating shared branches |
| Before opening a PR | Merging PRs into main |
| Cleaning up WIP commits | When history must be preserved |

---

### Slide 14 — The Mental Model
**No demo.** The simplest way to remember the difference:

- **Rebase** = "Pretend I started from the latest main"
- **Merge** = "Combine histories as they actually happened"

---

### Slide 15 — Common Mistakes
**No demo.** A list of the most common rebase mistakes and how to avoid them:
- Rebasing main
- Rebasing after pushing without using `--force-with-lease`
- Panicking during conflicts
- Forgetting `--abort` exists

---

### Slide 16 — Hands-On Exercise
A full exercise for self-study or group practice.

**Demo — "Reset for Fresh Start"**
Resets the state and runs `git init` so you have a clean slate.

Then follow the step-by-step commands shown on the slide in the **terminal on the left**:
1. Set up a repository with 2 commits
2. Create a feature branch with 3 commits
3. Advance main with a hotfix commit
4. Rebase feature onto main
5. Use interactive rebase to squash your 3 feature commits into 1

---

## Tips for Presenters

- Use the **"Rebase Guide"** button to open the panel before your session, then navigate through slides as you talk.
- On slides with demos, click the demo button first to show the "before" state, then explain what will happen, then move to the next slide that shows the "after".
- For Slide 3, click **"Show After Merge"** and explain the merge commit, then click **"Show After Rebase"** and contrast the linear result.
- On Slide 7, manually type `git rebase main` in the terminal after the demo sets up the branches. This makes the conflict feel live and real to the audience.
- On Slide 11, after the interactive rebase panel opens, walk through each action option before clicking Execute — it reads naturally as a live editing session.
- Close the guide panel (`✕`) whenever you want the audience to focus on the full graph without the panel in the way.

---

## Keyboard / Navigation Notes

- The panel does **not** trap keyboard focus, so you can type in the terminal while the guide is open.
- Clicking the dimmed scrim (left of the panel) closes the guide.
- The guide remembers your current slide within the session — closing and reopening it returns you to the same slide.
