# Demo Guide: Teaching Git with Simplified File Viewer

## Overview
The simplified file viewer uses a single `notes.txt` file with numbered lines, making it perfect for demonstrating Git concepts interactively and clearly.

---

## Demo 1: Basic Workflow

### Show the Staging Area Concept
```bash
git init
# File viewer shows: "✏️ Working Directory"
# Content: 10 numbered lines

# Click "✏️ Edit" button
# Change Line 5 to: "Line 5: I modified this line"
# Click "Save"

git add notes.txt
# Badge changes to: "📦 Staging Area"
# Students see the file is now "staged"

git commit -m "Update line 5"
# Badge returns to: "✏️ Working Directory"
# Staging area is cleared
```

**Teaching Point**: "The staging area is a holding area. You stage changes, then commit them. Notice how the badge shows whether you're looking at staged or working content."

---

## Demo 2: Branches Change File Content

### Show How Branches Point to Different Versions
```bash
git init
git add .
git commit -m "Initial version"

git branch feature
git switch feature

# Click Edit
# Change Line 3 to: "Line 3: FEATURE BRANCH version"
# Save

git add .
git commit -m "Feature work"

# Now switch back
git switch main
# Watch the file content change!
# Line 3 is back to original
```

**Teaching Point**: "Branches aren't copies of files—they're pointers to commits. Each commit stores a snapshot. When you switch branches, Git updates your working directory to match that branch's commit."

---

## Demo 3: Merge Conflicts - Crystal Clear

### Create a Conflict
```bash
git init
git add .
git commit -m "Initial"

git branch feature
git switch feature

# Edit Line 7
# Change to: "Line 7: Feature team's version"
git add .
git commit -m "Feature update"

git switch main

# Edit Line 7 (same line!)
# Change to: "Line 7: Main team's version"
git add .
git commit -m "Main update"

git merge feature
# ⚠️ CONFLICT!
```

### File Viewer Shows:
```
Line 1: Introduction
Line 2: This is a simple text file
Line 3: Each line is easy to track
Line 4: Perfect for learning Git
Line 5: You can edit any line
Line 6: Watch how commits work
<<<<<<< HEAD (main)
Line 7: Main team's version
=======
Line 7: Feature team's version
>>>>>>> feature
Line 8: Experience merge conflicts
Line 9: Understand rebasing
Line 10: Master version control
```

**Teaching Point**: "A conflict happens when two branches change the SAME line differently. Git doesn't know which version to keep, so it marks the conflict with `<<<<<<<`, `=======`, and `>>>>>>>`. You must choose."

### Resolve Conflict
```bash
# Option 1: Click "Accept Ours (HEAD)" - keeps main's version
# Option 2: Click "Accept Theirs" - keeps feature's version
# Option 3: Click "Edit Manually" - write your own resolution

# After resolving:
git add notes.txt
git commit -m "Resolve conflict"
```

**Teaching Point**: "Resolving conflicts is a normal part of collaborative work. Git gives you control—you decide which version to keep or combine them."

---

## Demo 4: Rebase Makes History Linear

### Show Rebase Clarity
```bash
git init
git add .
git commit -m "Base"

git branch feature
git switch feature

# Edit Line 4
# Change to: "Line 4: Feature addition"
git add .
git commit -m "Feature commit"

git switch main

# Edit Line 8
# Change to: "Line 8: Main addition"
git add .
git commit -m "Main commit"

# Before rebase: feature and main diverged
# Graph shows two paths

git switch feature
git rebase main

# File viewer shows BOTH changes now:
# - Line 4 has feature's change
# - Line 8 has main's change
# Graph now linear!
```

**Teaching Point**: "Rebase replays your commits on top of another branch. Instead of a merge commit joining two histories, you get a straight line. Look at the graph—no diamond shape, just a clean sequence."

---

## Demo 5: Understanding File Snapshots

### Show Commits Are Snapshots
```bash
git init
git add .
git commit -m "v1"

# Edit Line 1
git add .
git commit -m "v2"

# Edit Line 1 again
git add .
git commit -m "v3"

# Now use git log to see 3 commits in graph
# Click on different commits (if you add that feature)
# Each commit has complete file snapshot

git reset --hard <v1-commit-id>
# File returns to v1 content
```

**Teaching Point**: "Git doesn't store diffs—it stores complete snapshots. Each commit is the entire file at that point in time. That's why switching commits is fast and reliable."

---

## Demo 6: Three-Way Conflict Resolution

### Advanced Conflict Understanding
```bash
git init
git add .
git commit -m "Common ancestor"

git branch feature
git switch feature
# Change Line 5 to: "Line 5: Feature's specific change"
git add .
git commit -m "Feature"

git switch main
# Change Line 5 to: "Line 5: Main's specific change"
git add .
git commit -m "Main"

git merge feature
# Conflict on Line 5

# File viewer shows:
# <<<<<<< HEAD (main)
# Line 5: Main's specific change
# =======
# Line 5: Feature's specific change
# >>>>>>> feature
```

**Teaching Point**: "This is a 'three-way conflict'—there's a common ancestor (where Line 5 was identical), and both branches changed it. The markers show:
- `<<<<<<< HEAD`: Your current branch's version
- `=======`: The divider
- `>>>>>>> feature`: The incoming branch's version"

---

## Demo 7: Conflict-Free Merge

### Show When Merges Work Smoothly
```bash
git init
git add .
git commit -m "Start"

git branch feature
git switch feature
# Change Line 3
git add .
git commit -m "Feature"

git switch main
# Change Line 7 (different line!)
git add .
git commit -m "Main"

git merge feature
# ✓ Success! No conflict
# File has BOTH changes
```

**Teaching Point**: "Merges only conflict when the SAME lines are changed. Here, Line 3 and Line 7 are independent, so Git combines them automatically. Check the file—both changes are there!"

---

## Demo 8: Stash and Restore

### Show Stash as a Temporary Clipboard
```bash
git init
git add .
git commit -m "Clean state"

# Edit Line 6
# Change to: "Line 6: Work in progress"
git add notes.txt

# Oops, need to switch branches!
git stash
# File reverts to committed version
# Badge shows: "✏️ Working Directory"

# Do other work...
git switch main

# Come back
git stash pop
# Badge shows: "📦 Staging Area"
# Line 6 change is back!
```

**Teaching Point**: "Stash is like a clipboard for unfinished work. It saves your changes temporarily so you can switch contexts, then brings them back when you're ready."

---

## Why This Works Better

### Numbered Lines Are Clear
- Students can say "Line 7" instead of "line 142 in utils.py"
- Easy to spot changes at a glance
- No syntax highlighting to distract from Git concepts

### Single File = Focus
- No cognitive load from multiple files
- All attention on Git operations, not file management
- Perfect for demonstrating line-level conflicts

### Simple Text = Universal
- No programming language knowledge required
- Works for non-technical audiences
- Easy to modify in demonstrations

### Visual Feedback
- Badge shows staging vs working directory
- Conflict markers clearly highlighted
- Edit button encourages hands-on exploration

---

## Teaching Tips

### 1. Start Simple
Begin with "edit, stage, commit" before introducing branches

### 2. Use Line Numbers
"Let's both change Line 5" is clearer than "change the function"

### 3. Show Before Telling
Let students see the conflict markers before explaining them

### 4. Encourage Experimentation
"Try editing Line 3 on both branches and see what happens"

### 5. Compare States
"Notice how the file changed when we switched branches"

### 6. Visual-First
Point to the file viewer: "See? This is what Git stores"

---

## Common Student Questions

### "Where did my changes go?"
**Switch to main branch, edit Line 5, switch back to feature**
"Your changes are still in main! Each branch has its own version. Switch back and they're there."

### "Why do I need to stage?"
**Edit file, don't stage, try to commit**
"See the error? Git wants you to explicitly choose what to commit. This lets you commit only some changes."

### "What if I make a mistake?"
**Use git reset or git revert**
"Git never deletes commits permanently. You can always go back."

### "When do conflicts happen?"
**Create two scenarios: same line vs different lines**
"Only when the SAME line changes differently. Watch: different lines merge fine!"

---

## Extension Ideas

### Add More Lines
Create a longer file for more complex scenarios

### Themed Content
Change to: story.txt, recipe.txt, todo.txt for different audiences

### Multiple Files (Later)
After mastering one file, introduce a second for advanced topics

### Line-Level Indicators
Highlight which lines changed between commits (future feature)

---

## Success Metrics

Students understand Git when they can:
1. ✅ Explain staging without looking at docs
2. ✅ Predict which lines will conflict
3. ✅ Resolve a conflict without help
4. ✅ Describe what a commit contains (snapshot, not diff)
5. ✅ Understand why branches don't duplicate files

The simplified file viewer makes all these concepts **visible and interactive**.
