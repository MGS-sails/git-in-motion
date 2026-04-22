import type { Tutorial } from "./tutorialTypes";
import type { RepoState } from "./types";
import { advancedTutorials } from "./advancedTutorials";

export const basicTutorials: Tutorial[] = [
  {
    id: "basics-101",
    mode: "basic",
    title: "Git Basics 101",
    description: "Learn the fundamental Git commands: init, add, and commit. Perfect for absolute beginners!",
    difficulty: "beginner",
    estimatedTime: "5 min",
    icon: "🎯",
    steps: [
      {
        id: "init",
        title: "Initialize Your Repository",
        instruction: "Every Git journey starts with `git init`. This creates a new repository with a main branch. Type the command and watch what happens!",
        hints: [
          "Type: git init",
          "This command sets up Git tracking in your project"
        ],
        expectedCommands: ["git init"],
        validate: (state: RepoState) => state.initialized === true,
      },
      {
        id: "add",
        title: "Stage Your Changes",
        instruction: "Before you can commit, you need to stage your changes. Use `git add .` to stage all files in the working directory.",
        hints: [
          "Type: git add .",
          "The dot (.) means 'all files'",
          "This moves files to the staging area"
        ],
        expectedCommands: ["git add ."],
        validate: (state: RepoState) => state.stagingCount > 0,
      },
      {
        id: "commit",
        title: "Make Your First Commit",
        instruction: "Now commit your staged changes with a message. Try: `git commit -m \"My first commit\"`",
        hints: [
          "Type: git commit -m \"your message here\"",
          "The -m flag lets you add a message inline",
          "Messages should describe what changed"
        ],
        expectedCommands: ["git commit -m"],
        validate: (state: RepoState) => state.commits.length > 0,
      },
      {
        id: "status",
        title: "Check Your Status",
        instruction: "Great! Now use `git status` to see the current state of your repository.",
        hints: [
          "Type: git status",
          "This shows what branch you're on and what's changed"
        ],
        expectedCommands: ["git status"],
        validate: (_state: RepoState) => true, // Always passes after they run it
      },
    ],
  },
  {
    id: "branching-basics",
    mode: "basic",
    title: "Branching Basics",
    description: "Master branches - Git's killer feature. Learn to create, switch, and manage branches.",
    difficulty: "beginner",
    estimatedTime: "7 min",
    icon: "🌿",
    steps: [
      {
        id: "setup",
        title: "Set Up Your Repository",
        instruction: "First, let's set up a repository with some commits. Run: `git init`, then `git add .`, then `git commit -m \"Initial commit\"`",
        hints: [
          "Run three commands: init, add, commit",
          "Don't forget to stage with 'git add .' before committing"
        ],
        expectedCommands: ["git init", "git add", "git commit"],
        validate: (state: RepoState) => state.initialized && state.commits.length > 0,
      },
      {
        id: "create-branch",
        title: "Create a New Branch",
        instruction: "Create a new branch called 'feature' using `git branch feature`. Watch how a new label appears!",
        hints: [
          "Type: git branch feature",
          "Branches are just movable labels pointing to commits",
          "This doesn't switch to the branch yet"
        ],
        expectedCommands: ["git branch feature"],
        validate: (state: RepoState) => state.branches["feature"] !== undefined,
      },
      {
        id: "switch-branch",
        title: "Switch to Your New Branch",
        instruction: "Now switch to the feature branch: `git switch feature` (or `git checkout feature`)",
        hints: [
          "Type: git switch feature",
          "You can also use: git checkout feature",
          "Notice how HEAD moves to point at the feature branch"
        ],
        expectedCommands: ["git switch feature", "git checkout feature"],
        validate: (state: RepoState) => state.activeBranch === "feature",
      },
      {
        id: "commit-on-branch",
        title: "Make a Commit on the Branch",
        instruction: "Edit the file in the File Viewer, then stage and commit your changes on the feature branch.",
        hints: [
          "Click 'Edit' in the File Viewer to modify the file",
          "Then: git add .",
          "Then: git commit -m \"Feature work\"",
          "Notice the feature branch pointer moves forward"
        ],
        expectedCommands: ["git add", "git commit"],
        validate: (state: RepoState) => {
          return state.activeBranch === "feature" && state.commits.length >= 2;
        },
      },
      {
        id: "switch-back",
        title: "Switch Back to Main",
        instruction: "Switch back to main with `git switch main`. Notice how the file content changes in the File Viewer!",
        hints: [
          "Type: git switch main",
          "The working directory will update to match main's HEAD commit",
          "Your feature branch commits are still there!"
        ],
        expectedCommands: ["git switch main", "git checkout main"],
        validate: (state: RepoState) => state.activeBranch === "main",
      },
    ],
  },
  {
    id: "merging-101",
    mode: "basic",
    title: "Merging 101",
    description: "Learn how to merge branches and handle merge conflicts like a pro.",
    difficulty: "intermediate",
    estimatedTime: "10 min",
    icon: "🔗",
    steps: [
      {
        id: "setup-branches",
        title: "Create Two Diverging Branches",
        instruction: "Let's set up a scenario: Create a repo, make a commit, create a feature branch, make commits on both branches.",
        hints: [
          "1. git init",
          "2. git add . && git commit -m \"Initial\"",
          "3. git branch feature",
          "4. Edit file, git add ., git commit -m \"Main work\"",
          "5. git switch feature",
          "6. Edit file differently, git add ., git commit -m \"Feature work\""
        ],
        expectedCommands: ["git init", "git commit", "git branch", "git switch"],
        validate: (state: RepoState) => {
          const hasTwoBranches = Object.keys(state.branches).length >= 2;
          const hasMultipleCommits = state.commits.length >= 2;
          return hasTwoBranches && hasMultipleCommits;
        },
      },
      {
        id: "switch-to-main",
        title: "Switch to Main Branch",
        instruction: "Make sure you're on the main branch before merging. Use `git switch main`",
        hints: [
          "Type: git switch main",
          "You merge INTO the current branch",
          "So be on main to merge feature into main"
        ],
        expectedCommands: ["git switch main"],
        validate: (state: RepoState) => state.activeBranch === "main",
      },
      {
        id: "merge",
        title: "Merge the Feature Branch",
        instruction: "Now merge feature into main: `git merge feature`. This might create a merge commit or fast-forward!",
        hints: [
          "Type: git merge feature",
          "If there's a conflict, you'll need to resolve it",
          "If it fast-forwards, the main pointer just moves up"
        ],
        expectedCommands: ["git merge feature"],
        validate: (state: RepoState) => {
          // Check if there's a merge commit or if main has moved forward
          const mainBranch = state.branches["main"];
          const featureBranch = state.branches["feature"];
          if (!mainBranch || !featureBranch) return false;

          // Look for a merge commit (commit with 2 parents)
          const hasMergeCommit = state.commits.some(c => c.parents.length > 1);
          // Or check if main and feature point to the same commit (fast-forward)
          const fastForward = mainBranch.head === featureBranch.head;

          return hasMergeCommit || fastForward;
        },
      },
      {
        id: "check-log",
        title: "View the Merge History",
        instruction: "Use `git log` to see your merge commit. Notice it has two parent commits!",
        hints: [
          "Type: git log",
          "Merge commits have two parents",
          "This preserves both branches' history"
        ],
        expectedCommands: ["git log"],
        validate: (_state: RepoState) => true,
      },
    ],
  },
  {
    id: "time-travel",
    mode: "basic",
    title: "Time Travel with Reset",
    description: "Learn the power (and danger) of git reset. Undo commits and rewrite history.",
    difficulty: "intermediate",
    estimatedTime: "8 min",
    icon: "⏪",
    steps: [
      {
        id: "setup",
        title: "Create Multiple Commits",
        instruction: "Set up a repository with at least 3 commits so we have history to manipulate.",
        hints: [
          "git init, then make 3 commits",
          "Edit the file between commits",
          "Use git add . and git commit -m each time"
        ],
        expectedCommands: ["git init", "git commit"],
        validate: (state: RepoState) => state.commits.length >= 3,
      },
      {
        id: "soft-reset",
        title: "Try a Soft Reset",
        instruction: "Use `git reset --soft HEAD~1` to undo the last commit but keep changes staged.",
        hints: [
          "Type: git reset --soft HEAD~1",
          "HEAD~1 means 'one commit before HEAD'",
          "--soft keeps your changes in the staging area"
        ],
        expectedCommands: ["git reset --soft"],
        validate: (state: RepoState) => {
          // After soft reset, staging area should have content
          return state.stagingCount > 0;
        },
      },
      {
        id: "recommit",
        title: "Make a New Commit",
        instruction: "Now commit again with a different message: `git commit -m \"Better commit message\"`",
        hints: [
          "Your changes are still staged",
          "Just commit with a new message",
          "This is how you 'reword' the last commit"
        ],
        expectedCommands: ["git commit"],
        validate: (state: RepoState) => state.stagingCount === 0 && state.commits.length >= 3,
      },
      {
        id: "hard-reset-warning",
        title: "Try a Hard Reset (Careful!)",
        instruction: "Use `git reset --hard HEAD~1` to completely undo the last commit AND discard changes. ⚠️ This is destructive!",
        hints: [
          "Type: git reset --hard HEAD~1",
          "This moves the branch pointer back",
          "AND discards all changes",
          "Use with extreme caution in real projects!"
        ],
        expectedCommands: ["git reset --hard"],
        validate: (_state: RepoState) => true,
      },
    ],
  },
  {
    id: "rebase-mastery",
    mode: "basic",
    title: "Rebase Mastery",
    description: "Learn to rebase for a cleaner, linear history. Understand when to use rebase vs merge.",
    difficulty: "advanced",
    estimatedTime: "12 min",
    icon: "↻",
    steps: [
      {
        id: "setup-diverged",
        title: "Create Diverged Branches",
        instruction: "Set up two branches that have diverged: main and feature, each with unique commits.",
        hints: [
          "Init, commit on main",
          "Create feature branch",
          "Commit on main, switch to feature, commit on feature",
          "Now they've diverged"
        ],
        expectedCommands: ["git init", "git branch", "git commit"],
        validate: (state: RepoState) => {
          const hasBranches = Object.keys(state.branches).length >= 2;
          const hasCommits = state.commits.length >= 3;
          return hasBranches && hasCommits;
        },
      },
      {
        id: "rebase",
        title: "Rebase Feature onto Main",
        instruction: "Switch to feature, then `git rebase main` to replay feature's commits on top of main.",
        hints: [
          "First: git switch feature",
          "Then: git rebase main",
          "This 'replays' feature's commits onto main",
          "Creates new commit hashes!"
        ],
        expectedCommands: ["git switch feature", "git rebase main"],
        validate: (state: RepoState) => {
          // Check if there are any commits marked as rebased
          return state.commits.some(c => c.isRebase === true);
        },
      },
      {
        id: "observe-linear",
        title: "Observe Linear History",
        instruction: "Use `git log` to see the linear history. Notice there's no merge commit!",
        hints: [
          "Type: git log",
          "The graph should show a straight line",
          "No merge commits needed",
          "Cleaner history, but rewrites commits"
        ],
        expectedCommands: ["git log"],
        validate: (_state: RepoState) => true,
      },
      {
        id: "fast-forward-merge",
        title: "Fast-Forward Merge to Main",
        instruction: "Now switch to main and merge feature. This will be a fast-forward since feature is ahead!",
        hints: [
          "git switch main",
          "git merge feature",
          "Main's pointer just moves forward",
          "No merge commit created"
        ],
        expectedCommands: ["git switch main", "git merge feature"],
        validate: (state: RepoState) => {
          const mainBranch = state.branches["main"];
          const featureBranch = state.branches["feature"];
          return mainBranch?.head === featureBranch?.head;
        },
      },
    ],
  },
];

export const tutorials: Tutorial[] = [...basicTutorials, ...advancedTutorials];

export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find(t => t.id === id);
}

export function getTutorialsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): Tutorial[] {
  return tutorials.filter(t => t.difficulty === difficulty);
}

export function getTutorialsByMode(mode: "basic" | "advanced"): Tutorial[] {
  if (mode === "basic") return basicTutorials;
  return tutorials; // advanced shows all
}
