# Git in Motion - Interactive Git Workbook

A visual, hands-on guide to understanding Git. This workbook will walk you through Git's core concepts using an interactive visualization tool. Watch the graph change as you type commands!

## Getting Started

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (usually http://localhost:5173).

---

## Part 1: The Basics

### Exercise 1.1: Creating a Repository

Every Git project starts with initialization. Type this command:

```
git init
```

**What you should see:**
- The status changes to "Repository Active"
- A `main` branch appears (but it's empty - no commits yet!)

**Key concept:** `git init` creates a `.git` folder that stores all version history. The `main` branch exists but points to nothing until you make your first commit.

---

### Exercise 1.2: Your First Commit

Git requires two steps to save changes:

**Step 1: Stage your changes**
```
git add .
```

**What you should see:**
- A staging indicator appears showing "1 staged"
- The staging area is like a loading dock - you're preparing what goes into the next commit

**Step 2: Create the commit**
```
git commit -m "Initial commit"
```

**What you should see:**
- A purple node appears - this is your commit!
- The `main` branch pointer now points to it
- HEAD points to main

**Key concept:** Commits are snapshots. Each one has:
- A unique ID (the short hash shown above the node)
- A message describing the changes
- A pointer to its parent commit(s)

---

### Exercise 1.3: Building History

Let's create more commits to see how history forms:

```
git add .
git commit -m "Add feature A"
```

```
git add .
git commit -m "Add feature B"
```

**What you should see:**
- Three commits connected by lines
- Each new commit points to its parent
- The `main` branch pointer moves forward with each commit
- Time flows from bottom (oldest) to top (newest)

**Key concept:** Git history is a chain of commits. Each commit knows its parent, forming a linked list.

---

## Part 2: Branching

### Exercise 2.1: Creating a Branch

Branches let you work on different things simultaneously:

```
git branch feature
```

**What you should see:**
- A new `feature` branch appears, pointing to the same commit as `main`
- You're still on `main` (notice HEAD points to main)

**Key concept:** A branch is just a lightweight pointer (41 bytes!) to a commit. Creating a branch is instant and cheap.

---

### Exercise 2.2: Switching Branches

```
git switch feature
```

**What you should see:**
- HEAD now points to `feature`
- The status shows you're "on feature"
- Nothing else changed - same commits, just different active branch

**Key concept:** Switching branches changes what HEAD points to. Your commits stay exactly where they are.

---

### Exercise 2.3: Diverging History

Now let's make the branches diverge. While on `feature`:

```
git add .
git commit -m "Feature work 1"
```

```
git add .
git commit -m "Feature work 2"
```

**What you should see:**
- New commits appear in a separate lane (column)
- The `feature` branch moves forward
- `main` stays where it was

Now switch back to main and add commits there:

```
git switch main
```

```
git add .
git commit -m "Hotfix"
```

**What you should see:**
- The graph now shows two parallel lines of development
- `main` and `feature` have diverged from their common ancestor

**Key concept:** This is the power of branching - parallel, independent work streams.

---

## Part 3: Integrating Changes - MERGE vs REBASE

This is one of Git's most important concepts. There are two main ways to bring branches together.

### Exercise 3.1: Understanding the Setup

Before we compare merge and rebase, let's create a clean scenario. Start fresh:

```
git init
```

Create some initial commits:
```
git add .
git commit -m "Initial"
git add .
git commit -m "Base work"
```

Create and switch to a feature branch:
```
git branch feature
git switch feature
```

Add feature commits:
```
git add .
git commit -m "Feature A"
git add .
git commit -m "Feature B"
```

Go back to main and add more commits:
```
git switch main
git add .
git commit -m "Main work"
```

**Your graph should show:**
- `main` with 3 commits
- `feature` branching off after "Base work" with 2 commits
- The branches have diverged

---

### Exercise 3.2: Option A - MERGE

Merge combines two branches by creating a special "merge commit" with two parents.

From `main`, merge feature:
```
git merge feature
```

**What you should see:**
- A new commit appears with TWO parent lines (one from each branch)
- This merge commit is shown with a special icon
- The dashed line shows it came from another branch
- Both histories are preserved completely

**Advantages of Merge:**
- Preserves complete history exactly as it happened
- Safe - never rewrites existing commits
- Clear record of when branches were integrated
- Best for shared/public branches

**Disadvantages of Merge:**
- Can create a complex, non-linear history
- Merge commits add "noise" to the log

---

### Exercise 3.3: Option B - REBASE (Start Fresh)

Reset to try rebase instead. First, let's rebuild the scenario:

```
git init
git add .
git commit -m "Initial"
git add .
git commit -m "Base work"
git branch feature
git switch feature
git add .
git commit -m "Feature A"
git add .
git commit -m "Feature B"
git switch main
git add .
git commit -m "Main work"
```

Now switch to feature and rebase onto main:
```
git switch feature
git rebase main
```

**What you should see:**
- The old feature commits become faded/ghosted (orphaned)
- NEW commits appear on top of `main` with cyan badges
- These new commits have the same messages but DIFFERENT IDs
- The history is now LINEAR - no merge commit needed!

**Key insight:** Rebase literally "replays" your commits on top of another branch. The old commits still exist (shown faded) but are no longer reachable from any branch.

**Advantages of Rebase:**
- Creates clean, linear history
- Easier to read and understand
- No merge commits cluttering the log
- Great for local/private branches

**Disadvantages of Rebase:**
- Rewrites history (creates new commit hashes)
- DANGEROUS on shared branches - others have the old commits!
- Can be confusing if you don't understand it

---

### Exercise 3.4: Visual Comparison

Here's what the two approaches look like:

**After MERGE:**
```
         o---o  feature
        /     \
   o---o---o---M  main (M = merge commit with 2 parents)
```

**After REBASE:**
```
   o---o---o---o'---o'  main/feature (o' = replayed commits, linear!)

   (old commits orphaned, shown faded)
```

---

### Exercise 3.5: Fast-Forward Merge

There's a special case! If one branch hasn't diverged, Git can do a "fast-forward":

```
git init
git add .
git commit -m "Initial"
git branch feature
git switch feature
git add .
git commit -m "Feature work"
git switch main
git merge feature
```

**What you should see:**
- NO merge commit created!
- `main` pointer simply moved forward to where `feature` is
- The explanation says "Fast-forward merge"

**Key concept:** When there's nothing to merge (one branch is just ahead of the other), Git can just move the pointer. This is the cleanest outcome.

---

### Exercise 3.6: The Golden Rule of Rebase

**NEVER rebase commits that have been pushed/shared with others.**

Why? Because rebase creates NEW commits with different hashes. If someone else has the old commits:
- They have commits `abc123` and `def456`
- You rebase and create `ghi789` and `jkl012`
- Now there are two different versions of the "same" changes
- Chaos ensues when you try to sync!

**Safe to rebase:**
- Local commits not yet pushed
- Your personal feature branches before merging

**Never rebase:**
- `main` or other shared branches
- Commits that others have based work on

---

## Part 4: Undoing Changes

Git offers several ways to undo work. Understanding the differences is crucial.

### Exercise 4.1: Reset - Moving the Branch Pointer

Create some commits to work with:
```
git init
git add .
git commit -m "Commit 1"
git add .
git commit -m "Commit 2"
git add .
git commit -m "Commit 3"
git add .
git commit -m "Mistake"
```

Now "undo" the last commit with reset:
```
git reset --soft HEAD~1
```

**What you should see:**
- The branch pointer moves back one commit
- "Mistake" commit becomes orphaned (faded)
- Your staged changes are preserved (check the staging count)

**The three reset modes:**

| Mode | Branch Pointer | Staging Area | Working Directory |
|------|----------------|--------------|-------------------|
| `--soft` | Moves back | **Keeps changes** | Keeps changes |
| `--mixed` | Moves back | **Clears** | Keeps changes |
| `--hard` | Moves back | Clears | **Discards changes** |

Try each mode to see the difference:
```
git reset --mixed HEAD~1
```

```
git reset --hard HEAD~1
```

**Warning:** `--hard` is destructive! Those changes are gone forever.

---

### Exercise 4.2: Revert - Safe Undo

Unlike reset, revert creates a NEW commit that undoes changes:

```
git init
git add .
git commit -m "Commit 1"
git add .
git commit -m "Commit 2"
git add .
git commit -m "Add bug"
git add .
git commit -m "Commit 4"
```

Now revert the buggy commit (use its ID from the graph):
```
git revert <commit-id>
```

**What you should see:**
- A NEW commit appears with an orange "revert" badge
- The original "Add bug" commit is still there
- History is preserved, but the changes are undone

---

### Exercise 4.3: Reset vs Revert Decision Tree

```
Do you need to undo changes?
│
├─ Have the commits been shared/pushed?
│   │
│   ├─ YES → Use `git revert` (safe, preserves history)
│   │
│   └─ NO → Use `git reset` (cleaner, rewrites history)
│
└─ Do you need an audit trail of the undo?
    │
    ├─ YES → Use `git revert` (creates undo commit)
    │
    └─ NO → Use `git reset` (no trace of mistake)
```

---

## Part 5: Cherry-Pick

Sometimes you need just ONE specific commit from another branch.

### Exercise 5.1: Selective Commit Copying

```
git init
git add .
git commit -m "Initial"
git branch feature
git switch feature
git add .
git commit -m "Feature work"
git add .
git commit -m "Critical bug fix"
git add .
git commit -m "More feature work"
```

Now, let's say `main` needs ONLY the bug fix, not the feature work:

```
git switch main
```

Look at the graph and find the commit ID for "Critical bug fix", then:
```
git cherry-pick <bug-fix-commit-id>
```

**What you should see:**
- A NEW commit on main with a pink cherry badge
- Same message as the original, but DIFFERENT commit ID
- The original commit on feature is unchanged

**Key concept:** Cherry-pick copies a commit's changes, creating a new commit. It's like rebase for a single commit.

**Use cases for cherry-pick:**
- Applying a hotfix to multiple branches
- Extracting one useful commit from an abandoned branch
- Backporting fixes to older release branches

---

## Part 6: Stash

Sometimes you need to quickly switch context without committing half-done work.

### Exercise 6.1: Saving Work Temporarily

```
git init
git add .
git commit -m "Initial"
git add .
```

You have staged changes but need to switch branches urgently. Stash them:
```
git stash
```

**What you should see:**
- Staging count goes to 0
- Your changes are safely stored

Check what's in the stash:
```
git stash list
```

Now you can switch branches, do other work, etc. When ready to resume:
```
git stash pop
```

**What you should see:**
- Your staged changes are restored!
- The stash entry is removed

---

### Exercise 6.2: Stash Commands Reference

| Command | Description |
|---------|-------------|
| `git stash` | Save current changes to stash |
| `git stash pop` | Restore latest stash and remove it |
| `git stash list` | See all stashed changes |
| `git stash drop` | Discard top stash entry |
| `git stash clear` | Remove all stash entries |

**Think of stash as a clipboard** - you can save work, switch context, then paste it back later.

---

## Part 7: Detached HEAD State

### Exercise 7.1: Checking Out a Commit Directly

```
git init
git add .
git commit -m "Commit 1"
git add .
git commit -m "Commit 2"
git add .
git commit -m "Commit 3"
```

Now checkout an old commit directly (use its ID from the graph):
```
git checkout <commit-1-id>
```

**What you should see:**
- Warning indicator: "DETACHED HEAD" with a red warning
- HEAD points directly to a commit, not a branch
- You're in "detached HEAD state"

**What is detached HEAD?**

Normally: `HEAD → branch → commit`

Detached: `HEAD → commit` (no branch in between!)

---

### Exercise 7.2: The Danger of Detached HEAD

Try making a commit while detached:
```
git add .
git commit -m "Detached commit"
```

**What you should see:**
- A new commit is created
- But it's not on any branch!

Now switch back to main:
```
git switch main
```

**What you should see:**
- Your "Detached commit" is now orphaned (faded/ghosted)
- It's not reachable from any branch
- Git may garbage collect it eventually!

---

### Exercise 7.3: Saving Detached HEAD Commits

If you accidentally made useful commits in detached HEAD state, save them:

```
git checkout <commit-id>  # Go back to your detached commit
git branch rescue-branch  # Create a branch pointing to it
git switch rescue-branch  # Switch to the new branch
```

Now your commits are safe on a real branch!

---

## Visual Reference

### The Graph Legend

| Visual | Meaning |
|--------|---------|
| Purple circle | Regular commit |
| Circle with ⚭ icon | Merge commit (2+ parents) |
| Cyan badge with ↻ | Rebased commit |
| Orange badge with ↩ | Revert commit |
| Pink badge with cherry | Cherry-picked commit |
| Faded with ghost | Orphaned commit (not on any branch) |
| Gold pulsing rings | Current HEAD location |
| Dashed line | Merge edge (from another branch) |

### Color Meanings

| Color | Concept |
|-------|---------|
| Purple | Commits |
| Green | Branches |
| Gold | HEAD (your current position) |
| Blue | Staging area |
| Pink | Merge operations |
| Cyan | Rebase operations |
| Orange | Revert operations |
| Red | Cherry-pick / Warnings |

---

## Quick Reference Card

### Basic Commands
| Command | Description |
|---------|-------------|
| `git init` | Create a new repository |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Create a commit |
| `git status` | See current state |
| `git log` | View commit history |

### Branching
| Command | Description |
|---------|-------------|
| `git branch <name>` | Create a branch |
| `git switch <name>` | Switch to a branch |
| `git branch -d <name>` | Delete a branch |
| `git checkout <commit>` | Enter detached HEAD |

### Integrating Changes
| Command | Description |
|---------|-------------|
| `git merge <branch>` | Merge branch (preserves history) |
| `git rebase <branch>` | Rebase onto branch (linear history) |
| `git cherry-pick <id>` | Copy one specific commit |

### Undoing Changes
| Command | Description |
|---------|-------------|
| `git reset --soft HEAD~1` | Undo commit, keep staged |
| `git reset --mixed HEAD~1` | Undo commit, unstage changes |
| `git reset --hard HEAD~1` | Undo commit, discard everything |
| `git revert <commit>` | Create undo commit (safe) |

### Temporary Storage
| Command | Description |
|---------|-------------|
| `git stash` | Save work temporarily |
| `git stash pop` | Restore saved work |
| `git stash list` | View stash stack |

---

## Key Takeaways

### 1. Commits are Snapshots
Each commit captures the complete state of your project at a point in time. Commits are identified by SHA hashes and form a chain through parent pointers.

### 2. Branches are Just Pointers
A branch is simply a 41-byte file containing a commit hash. This is why branching in Git is instant and you should branch liberally.

### 3. HEAD Shows Where You Are
HEAD usually points to a branch name, which points to a commit. When HEAD points directly to a commit (detached), you're in a potentially dangerous state.

### 4. Merge vs Rebase - Know the Tradeoffs

| Aspect | Merge | Rebase |
|--------|-------|--------|
| History | Non-linear, preserves all | Linear, cleaner |
| Commits | Creates merge commit | Rewrites commits |
| Safety | Safe for shared branches | Only for local work |
| Traceability | Shows when integration happened | Hides integration point |

**Rule of thumb:** Rebase your local work, merge shared work.

### 5. Reset vs Revert - Local vs Shared

| Aspect | Reset | Revert |
|--------|-------|--------|
| History | Rewrites/removes | Adds new commit |
| Use when | Commits are local only | Commits have been shared |
| Trace | No trace of mistake | Explicit undo record |
| Safety | Can lose work | Always safe |

### 6. Orphaned Commits Eventually Disappear
Commits not reachable from any branch will be garbage collected. If you see faded commits, they're orphaned - create a branch to save them!

---

## Practice Challenges

### Challenge 1: Basic Workflow
1. Initialize a repository
2. Create 3 commits on main
3. Create a feature branch
4. Add 2 commits to feature
5. Switch between branches and observe HEAD

### Challenge 2: Merge Integration
1. Set up diverged main and feature branches (2 commits each after split)
2. Merge feature into main
3. Identify the merge commit and its two parents

### Challenge 3: Rebase Integration
1. Set up the same diverged scenario
2. Rebase feature onto main instead
3. Identify the orphaned commits
4. Compare the history shape to Challenge 2

### Challenge 4: Undo Scenarios
1. Create 5 commits
2. Use `reset --soft` to undo one, observe staging
3. Use `reset --hard` to undo another, observe data loss
4. Use `revert` on a middle commit, observe the new commit

### Challenge 5: Cherry-Pick Hotfix
1. Create main with 2 commits
2. Create feature with 3 commits (include one bug fix)
3. Cherry-pick ONLY the bug fix to main
4. Verify both branches have the fix

### Challenge 6: Rescue Mission
1. Create some commits
2. Checkout an old commit (enter detached HEAD)
3. Create commits in detached state
4. Switch back to main (orphan your commits)
5. Rescue them by creating a branch

---

## Common Mistakes and How to Fix Them

### "I committed to the wrong branch!"
```
git reset --soft HEAD~1     # Undo commit, keep changes staged
git stash                   # Save changes
git switch correct-branch   # Switch to right branch
git stash pop              # Restore changes
git commit -m "message"    # Commit on correct branch
```

### "I need to undo a pushed commit!"
```
git revert <commit-id>     # Create an undo commit
git push                   # Push the revert (safe!)
```

### "I made commits in detached HEAD!"
```
git branch rescue          # Create branch at current commit
git switch rescue          # Now you're safe!
```

### "I want to combine my last 3 commits!"
```
git reset --soft HEAD~3    # Undo 3 commits, keep changes
git commit -m "Combined"   # Make one new commit
```

---

Happy learning! The best way to understand Git is to experiment. You can always start fresh with `git init` and try again.
