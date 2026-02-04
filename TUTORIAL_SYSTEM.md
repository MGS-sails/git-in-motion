# Tutorial System Documentation

## Overview
The tutorial system provides guided, step-by-step learning experiences for Git concepts. Each tutorial validates user actions and provides hints to help learners master Git commands interactively.

## Features Implemented

### ✅ Core Components
1. **TutorialSelector.vue** - Browse and select tutorials
2. **TutorialPanel.vue** - Display tutorial steps with progress tracking
3. **Tutorial Engine** - Validation and progression logic

### ✅ Tutorial Content
5 tutorials covering different skill levels:

1. **Git Basics 101** (Beginner, 5 min)
   - Initialize repository
   - Stage changes
   - Make first commit
   - Check status

2. **Branching Basics** (Beginner, 7 min)
   - Create branches
   - Switch between branches
   - Commit on branches
   - Understand branch pointers

3. **Merging 101** (Intermediate, 10 min)
   - Create diverging branches
   - Perform merges
   - Handle merge commits
   - View merge history

4. **Time Travel with Reset** (Intermediate, 8 min)
   - Use soft reset
   - Use hard reset
   - Understand dangers of reset
   - Recommit with new messages

5. **Rebase Mastery** (Advanced, 12 min)
   - Create diverged branches
   - Rebase feature onto main
   - Observe linear history
   - Fast-forward merge

### ✅ Tutorial Features

- **Step Validation**: Automatic validation of each step
- **Progress Tracking**: Visual progress bar showing completion
- **Hint System**: Progressive hints for stuck learners
- **Expected Commands**: Shows what commands are expected
- **Completion Animation**: Celebration modal on tutorial completion
- **Difficulty Badges**: Visual difficulty indicators

## File Structure

```
src/
├── engine/
│   ├── tutorialTypes.ts     # TypeScript interfaces
│   └── tutorials.ts          # Tutorial content & data
├── components/
│   ├── TutorialSelector.vue  # Tutorial browser
│   └── TutorialPanel.vue     # Active tutorial display
└── App.vue                   # Main app with tutorial integration
```

## How It Works

### 1. Tutorial Selection
- User clicks "Start Learning" button
- Tutorial selector displays categorized tutorials
- User selects a tutorial to begin

### 2. Tutorial Execution
- State resets to fresh repository
- Tutorial panel displays current step
- User follows instructions
- Validation runs after each command

### 3. Step Progression
- Green checkmark appears when step is validated
- "Next Step" button becomes available
- Auto-advances with smooth transitions

### 4. Hints
- First hint button pulses to draw attention
- Progressive hint reveal (one at a time)
- Tracks number of hints used

### 5. Completion
- Celebration modal shows on final step
- Auto-closes after 3 seconds
- Returns to normal mode

## Adding New Tutorials

To add a new tutorial, edit `src/engine/tutorials.ts`:

```typescript
{
  id: "unique-id",
  title: "Tutorial Title",
  description: "Brief description",
  difficulty: "beginner" | "intermediate" | "advanced",
  estimatedTime: "X min",
  icon: "🎯",
  steps: [
    {
      id: "step-id",
      title: "Step Title",
      instruction: "Clear instructions for the user",
      hints: ["Hint 1", "Hint 2", "Hint 3"],
      expectedCommands: ["git command"],
      validate: (state: RepoState) => {
        // Return true if step is complete
        return state.someCondition === true;
      },
    },
    // ... more steps
  ],
}
```

## Validation Functions

Each step has a `validate` function that receives the current `RepoState`:

```typescript
validate: (state: RepoState) => {
  // Check if repository is initialized
  if (state.initialized) return true;

  // Check number of commits
  if (state.commits.length >= 3) return true;

  // Check current branch
  if (state.activeBranch === "main") return true;

  // Check for specific branch
  if (state.branches["feature"]) return true;

  // Complex validation
  const hasMergeCommit = state.commits.some(c => c.parents.length > 1);
  return hasMergeCommit;
}
```

## UI/UX Details

### Colors by Difficulty
- **Beginner**: Green (var(--color-branch))
- **Intermediate**: Yellow/Orange (var(--color-head))
- **Advanced**: Pink (var(--color-merge))

### Animations
- Tutorial selector: Fade in up
- Step completion: Success pulse
- Hint reveal: Slide down
- Completion modal: Slide up with celebration bounce

### Responsive Design
- Grid layout adjusts for mobile
- Tutorial cards stack on small screens
- Modal is mobile-friendly

## Future Enhancements

### Potential Additions
1. **Save Progress** - Resume tutorials later
2. **Achievement System** - Badges for completion
3. **Leaderboards** - Compare completion times
4. **Challenge Mode** - Solve specific Git problems
5. **Custom Scenarios** - User-created tutorials
6. **Video Integration** - Embedded tutorial videos
7. **Code Snippets** - Copy-paste commands
8. **Keyboard Shortcuts** - Quick navigation
9. **Dark Mode** - Theme toggle
10. **Export/Share** - Share progress with others

## Testing Tutorials

To test a tutorial:
1. Start the app
2. Click "Start Learning"
3. Select a tutorial
4. Follow the steps
5. Verify validation works
6. Check hints are helpful
7. Test edge cases

## Known Limitations

1. Tutorials reset the entire state
2. No way to pause/resume
3. Hints count isn't persisted
4. Can't skip steps (by design)
5. Validation is client-side only

## Performance Considerations

- Tutorials are loaded on-demand
- State validation is synchronous
- Minimal re-renders with computed properties
- Efficient animations with CSS transitions

---

Built with ❤️ for Git learners everywhere!
