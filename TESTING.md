# Testing Guide for File Viewer Feature

## Feature Overview
The File Viewer feature adds:
- Multiple file tracking (main.py, utils.py, README.md)
- User-editable content in the file viewer
- Toggle-able panel with smooth animations
- Git conflict markers and resolution UI
- File staging and commit snapshots

## Test Cases

### 1. Basic File Viewing
**Steps:**
1. Run `git init`
2. Observe the File Viewer panel appears below the graph
3. Click on different file tabs (main.py, utils.py, README.md)

**Expected:**
- ✅ Three files are visible in tabs
- ✅ Each file displays its content with syntax highlighting (Python keywords in purple)
- ✅ Badge shows "✏️ Working Directory"

### 2. File Editing
**Steps:**
1. Run `git init`
2. Click on main.py content area to edit
3. Change text in the textarea
4. Click "Save"
5. Run `git status`

**Expected:**
- ✅ File enters edit mode with textarea
- ✅ Save button commits changes to working directory
- ✅ `git status` shows "1 file(s) modified: main.py"
- ✅ File viewer still displays working directory

### 3. Staging Files
**Steps:**
1. Run `git init`
2. Edit main.py (change "Hello, Git!" to "Hello, World!")
3. Click Save
4. Run `git add main.py`

**Expected:**
- ✅ `git add` confirmation message
- ✅ Badge changes to "📦 Staging Area"
- ✅ File viewer now shows staged version
- ✅ Only main.py is staged (other files remain in working directory)

### 4. Staging All Files
**Steps:**
1. Run `git init`
2. Run `git add .`

**Expected:**
- ✅ All 3 files move to staging area
- ✅ Badge shows "📦 Staging Area"
- ✅ Message confirms 3 files staged

### 5. Committing Files
**Steps:**
1. Run `git init`
2. Run `git add .`
3. Run `git commit -m "Initial commit"`

**Expected:**
- ✅ Commit created successfully
- ✅ Staging area cleared
- ✅ Badge returns to "✏️ Working Directory"
- ✅ Files remain visible in viewer

### 6. Multiple Commits
**Steps:**
1. Run `git init`
2. Run `git add . && git commit -m "First commit"`
3. Edit utils.py
4. Run `git add utils.py`
5. Run `git commit -m "Update utils"`
6. Run `git log`

**Expected:**
- ✅ Two commits appear in graph
- ✅ Each commit stores its file snapshots
- ✅ File viewer shows current working directory state

### 7. Branch Switching
**Steps:**
1. Run `git init && git add . && git commit -m "Initial"`
2. Run `git branch feature`
3. Run `git switch feature`
4. Edit main.py (change to "Feature branch!")
5. Run `git add . && git commit -m "Feature work"`
6. Run `git switch main`

**Expected:**
- ✅ Switching to feature shows feature's file content
- ✅ Switching back to main restores main's file content
- ✅ File viewer updates to match branch HEAD

### 8. Merge Without Conflicts
**Steps:**
1. Run `git init && git add . && git commit -m "Initial"`
2. Run `git branch feature`
3. Run `git switch feature`
4. Edit utils.py (add a new function)
5. Run `git add . && git commit -m "Add function"`
6. Run `git switch main`
7. Run `git merge feature`

**Expected:**
- ✅ Fast-forward merge succeeds
- ✅ Working directory updates with merged content
- ✅ No conflicts shown

### 9. Merge With Conflicts
**Steps:**
1. Run `git init && git add . && git commit -m "Initial"`
2. Run `git branch feature`
3. Run `git switch feature`
4. Edit main.py line 3 to: `print("Feature branch!")`
5. Run `git add . && git commit -m "Feature change"`
6. Run `git switch main`
7. Edit main.py line 3 to: `print("Main branch!")`
8. Run `git add . && git commit -m "Main change"`
9. Run `git merge feature`

**Expected:**
- ✅ Merge fails with conflict message
- ✅ File viewer auto-expands
- ✅ Conflict badge appears: "⚠️ 1 conflict(s)"
- ✅ main.py tab shows warning dot
- ✅ File content shows conflict markers:
  ```
  <<<<<<< HEAD (main)
  print("Main branch!")
  =======
  print("Feature branch!")
  >>>>>>> feature
  ```
- ✅ Conflict banner displays with resolution buttons
- ✅ `git status` shows conflict

### 10. Conflict Resolution - Accept Ours
**Steps:**
1. Create conflict as in Test 9
2. Click "Accept Ours" button

**Expected:**
- ✅ File content changes to main branch version
- ✅ Conflict markers removed
- ✅ Conflict badge disappears
- ✅ File tab no longer shows warning

### 11. Conflict Resolution - Accept Theirs
**Steps:**
1. Create conflict as in Test 9
2. Click "Accept Theirs" button

**Expected:**
- ✅ File content changes to feature branch version
- ✅ Conflict markers removed
- ✅ Conflict badge disappears

### 12. Conflict Resolution - Manual Edit
**Steps:**
1. Create conflict as in Test 9
2. Click "Edit Manually" button
3. Edit the file to resolve conflict manually
4. Click "Save"
5. Run `git add main.py`
6. Run `git commit -m "Resolve conflict"`

**Expected:**
- ✅ Edit mode activates
- ✅ Can manually edit conflict markers
- ✅ Save updates working directory
- ✅ `git add` marks conflict as resolved
- ✅ Commit succeeds

### 13. Merge Abort
**Steps:**
1. Create conflict as in Test 9
2. Run `git merge --abort`

**Expected:**
- ✅ Conflicts cleared
- ✅ Working directory restored to HEAD state
- ✅ Conflict badge disappears
- ✅ File viewer shows pre-merge content

### 14. File Viewer Collapse/Expand
**Steps:**
1. Run `git init`
2. Click on "📄 File Viewer" header

**Expected:**
- ✅ Panel collapses smoothly (0.6s animation)
- ✅ Toggle icon rotates from ▼ to ▶
- ✅ Click again to expand
- ✅ Content fades in smoothly

### 15. Auto-Expand on Conflict
**Steps:**
1. Collapse the File Viewer panel
2. Create a merge conflict (as in Test 9)

**Expected:**
- ✅ File Viewer automatically expands when conflict occurs
- ✅ Conflict is immediately visible to user

### 16. Git Diff
**Steps:**
1. Run `git init && git add . && git commit -m "Initial"`
2. Edit main.py
3. Run `git diff`
4. Run `git diff main.py`

**Expected:**
- ✅ `git diff` lists all modified files
- ✅ `git diff main.py` shows specific file changed
- ✅ Message directs to file viewer for visual inspection

### 17. Stash with Files
**Steps:**
1. Run `git init && git add . && git commit -m "Initial"`
2. Edit main.py
3. Run `git add main.py`
4. Run `git stash`
5. Run `git stash pop`

**Expected:**
- ✅ Stash saves file content
- ✅ Staging area cleared after stash
- ✅ Pop restores file to staging area
- ✅ File viewer shows restored content

### 18. Syntax Highlighting
**Steps:**
1. Run `git init`
2. View main.py

**Expected:**
- ✅ Python keywords (def, if, return, etc.) in purple
- ✅ Comments (#) in gray/italic
- ✅ Strings in green
- ✅ Numbers in orange
- ✅ README.md shown as plain text

### 19. Multiple File Conflicts
**Steps:**
1. Create conflicts in both main.py and utils.py
2. Observe conflict badge

**Expected:**
- ✅ Badge shows "⚠️ 2 conflict(s)"
- ✅ Both files show warning dots
- ✅ Can resolve each file independently
- ✅ Badge updates as conflicts resolved

### 20. Rebase with Files
**Steps:**
1. Create two branches with different file changes
2. Run `git rebase <branch>`

**Expected:**
- ✅ Working directory updates to rebased commits
- ✅ File viewer shows rebased file content
- ✅ Files from rebased commits preserved

## Visual Checks

### File Viewer Appearance
- ✅ Glass-morphism card style matching other components
- ✅ Smooth rounded corners (20px border-radius)
- ✅ Proper backdrop blur effect
- ✅ File tabs with hover effects
- ✅ Active tab highlighted with purple border

### Conflict Markers Highlighting
- ✅ `<<<<<<< HEAD` in green background
- ✅ `=======` in yellow/orange background
- ✅ `>>>>>>> branch` in pink background
- ✅ Each marker clearly distinguishable

### Badges
- ✅ Conflict badge: yellow/orange with warning icon
- ✅ Staging badge: blue with folder icon
- ✅ Working badge: muted gray

### Animations
- ✅ Panel collapse/expand: 0.6s cubic-bezier
- ✅ File tab switching: instant
- ✅ Edit mode transition: smooth
- ✅ Auto-expand on conflict: smooth

## Performance Checks
- ✅ File viewer renders without lag
- ✅ Switching files is instant
- ✅ Syntax highlighting doesn't slow down rendering
- ✅ Large file content handled gracefully (scrollable)

## Edge Cases

### Empty Staging
- ✅ Attempting `git commit` with empty staging shows error

### Non-existent File
- ✅ `git add nonexistent.py` shows error
- ✅ Lists available files

### Conflict Without Resolution
- ✅ Cannot commit with unresolved conflicts
- ✅ Clear error message with file list

### Switch Branch with Staged Changes
- ✅ Staged changes preserved (or cleared based on implementation)

## Known Limitations (Expected Behavior)
- Syntax highlighting only implemented for Python files
- File viewer shows max 3 sample files initially
- Conflict resolution doesn't show line-by-line diff view
- No file creation/deletion UI (files come from commits)

## Success Criteria
All test cases should pass with expected behavior. The feature should:
1. Provide clear visual feedback at each step
2. Match Git's conceptual model for staging/committing
3. Make merge conflicts understandable and resolvable
4. Enhance the educational experience of Git in Motion
