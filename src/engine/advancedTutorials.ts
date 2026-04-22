import type { Tutorial } from "./tutorialTypes";
import type { RepoState } from "./types";

export const advancedTutorials: Tutorial[] = [
  // ─── Tutorial 1: Tags ────────────────────────────────────────────────────────
  {
    id: "versioning-milestones",
    title: "Versioning Research Milestones",
    description:
      "Learn to use git tags to mark key points in your analysis — paper submissions, stable versions, and thesis milestones.",
    difficulty: "advanced",
    estimatedTime: "12 min",
    icon: "🏷️",
    mode: "advanced",
    steps: [
      {
        id: "setup-analysis",
        title: "Set Up an Analysis Repository",
        instruction:
          "Simulate a research project. Run `git init`, then `git add .` and `git commit -m \"Initial analysis pipeline\"`. This is your starting point.",
        hints: [
          "git init",
          "git add .",
          "git commit -m \"Initial analysis pipeline\"",
        ],
        expectedCommands: ["git init", "git add", "git commit"],
        validate: (state: RepoState) =>
          state.initialized && state.commits.length >= 1,
      },
      {
        id: "add-results",
        title: "Add More Analysis Commits",
        instruction:
          "Edit the file (click Edit in the File Viewer), then stage and commit twice more: `git commit -m \"Add normalisation method\"` and `git commit -m \"First results complete\"`.",
        hints: [
          "Edit the file in the File Viewer",
          "git add .",
          "git commit -m \"Add normalisation method\"",
          "Edit again, then git add . && git commit -m \"First results complete\"",
        ],
        expectedCommands: ["git add", "git commit"],
        validate: (state: RepoState) => state.commits.length >= 3,
      },
      {
        id: "create-lightweight-tag",
        title: "Create a Lightweight Tag",
        instruction:
          "Mark this as your first stable version: `git tag v0.1`. This is a lightweight tag — just a name pointing to the current commit.",
        hints: [
          "Type: git tag v0.1",
          "Lightweight tags have no extra metadata",
          "Look for the amber tag label appearing on the commit in the graph",
        ],
        expectedCommands: ["git tag v0.1"],
        validate: (state: RepoState) =>
          state.tags?.some((t) => t.name === "v0.1") ?? false,
      },
      {
        id: "create-annotated-tag",
        title: "Create an Annotated Tag for Paper Submission",
        instruction:
          "Now tag for a major milestone with a message: `git tag -a submission-round-1 -m \"Analysis as submitted to Nature Methods\"`",
        hints: [
          "Annotated tags store extra metadata: author, date, message",
          "Type: git tag -a submission-round-1 -m \"Analysis as submitted to Nature Methods\"",
          "The -a flag means annotated, -m adds the message",
        ],
        expectedCommands: ["git tag -a submission-round-1"],
        validate: (state: RepoState) =>
          state.tags?.some(
            (t) => t.name === "submission-round-1" && t.isAnnotated
          ) ?? false,
      },
      {
        id: "list-tags",
        title: "List All Tags",
        instruction:
          "Run `git tag` to see all tags. Notice both the lightweight and annotated tags. The graph shows tags as amber labels on commits.",
        hints: [
          "Type: git tag",
          "Tags are permanent — they don't move when you commit",
          "Branches are labels that move; tags are labels that stay",
        ],
        expectedCommands: ["git tag"],
        validate: (_state: RepoState) => true,
      },
    ],
  },

  // ─── Tutorial 2: Interactive Rebase ──────────────────────────────────────────
  {
    id: "clean-history",
    title: "Cleaning History Before Sharing",
    description:
      "Use interactive rebase to turn messy 'WIP' commits into a clean, meaningful history before sharing with collaborators or supervisors.",
    difficulty: "advanced",
    estimatedTime: "15 min",
    icon: "✨",
    mode: "advanced",
    steps: [
      {
        id: "create-messy-history",
        title: "Create a Realistic Messy History",
        instruction:
          "Set up a repo and make 4 commits as you would in real work: `git init`, then commit: \"Initial analysis\", \"WIP\", \"fix typo\", \"working now\"",
        hints: [
          "git init",
          "git add . && git commit -m \"Initial analysis\"",
          "Edit file, git add . && git commit -m \"WIP\"",
          "Edit file, git add . && git commit -m \"fix typo\"",
          "Edit file, git add . && git commit -m \"working now\"",
        ],
        expectedCommands: ["git init", "git commit"],
        validate: (state: RepoState) => state.commits.length >= 4,
      },
      {
        id: "open-interactive-rebase",
        title: "Open Interactive Rebase",
        instruction:
          "Type `git rebase -i HEAD~3` to start an interactive rebase of the last 3 commits. The Interactive Rebase panel will appear.",
        hints: [
          "Type: git rebase -i HEAD~3",
          "HEAD~3 means 'last 3 commits'",
          "The panel shows your commits with actions you can change",
        ],
        expectedCommands: ["git rebase -i"],
        validate: (state: RepoState) =>
          state.pendingInteractiveRebase?.active === true,
      },
      {
        id: "configure-rebase",
        title: "Configure the Rebase Plan",
        instruction:
          "In the Interactive Rebase panel: set 'WIP' and 'fix typo' to **squash**, and reword 'working now' to 'Add normalisation method'. Then click Execute.",
        hints: [
          "Squash combines the commit with the one above it",
          "Reword lets you change the commit message",
          "Drop would delete a commit entirely",
          "The first commit should remain 'pick'",
        ],
        expectedCommands: [],
        validate: (state: RepoState) =>
          state.pendingInteractiveRebase === null &&
          state.commits.some((c) => c.isRebase === true),
      },
      {
        id: "observe-clean-history",
        title: "Observe the Clean History",
        instruction:
          "Run `git log` to see the result. Notice that the messy WIP commits are gone, replaced by clean, meaningful ones. The old commits are shown as orphaned (greyed out).",
        hints: [
          "Type: git log",
          "Orphaned commits are the old ones — still exist but unreachable",
          "This is what your supervisor will see when you share the branch",
        ],
        expectedCommands: ["git log"],
        validate: (_state: RepoState) => true,
      },
    ],
  },

  // ─── Tutorial 3: Reflog Recovery ─────────────────────────────────────────────
  {
    id: "recover-lost-analysis",
    title: "Recovering Lost Analysis",
    description:
      "Use git reflog to recover from an accidental git reset --hard. Nothing is truly lost with git.",
    difficulty: "advanced",
    estimatedTime: "10 min",
    icon: "🔍",
    mode: "advanced",
    steps: [
      {
        id: "build-history",
        title: "Build Some Commit History",
        instruction:
          "Set up a repository with 3 commits representing 3 days of analysis work.",
        hints: [
          "git init",
          "git add . && git commit -m \"Day 1: preprocessing pipeline\"",
          "Edit file, git add . && git commit -m \"Day 2: normalisation method\"",
          "Edit file, git add . && git commit -m \"Day 3: statistical analysis\"",
        ],
        expectedCommands: ["git init", "git commit"],
        validate: (state: RepoState) => state.commits.length >= 3,
      },
      {
        id: "accidental-reset",
        title: "Simulate an Accidental Reset",
        instruction:
          "Oops — run `git reset --hard HEAD~2` to accidentally undo two commits. Watch the graph: two commits are now orphaned!",
        hints: [
          "Type: git reset --hard HEAD~2",
          "This moves the branch pointer back 2 commits",
          "The files AND staging area are reset to match",
          "Don't panic — reflog has everything",
        ],
        expectedCommands: ["git reset --hard"],
        validate: (state: RepoState) => {
          // After reset --hard HEAD~2, branch head should be at the first commit
          const active = state.activeBranch;
          if (!active) return false;
          const branch = state.branches[active];
          if (!branch?.head) return false;
          // Check that there are commits after HEAD that are orphaned
          const orphanedCount = state.commits.filter((c) => {
            // A commit is orphaned if it's not in the ancestry of the branch head
            return c.id !== branch.head && !c.parents.includes(branch.head ?? "");
          }).length;
          return orphanedCount > 0 || state.reflog.length > 1;
        },
      },
      {
        id: "consult-reflog",
        title: "Consult the Reflog",
        instruction:
          "Run `git reflog` to see your HEAD movement history. Find the commit hash from before the reset. Look for the 'Day 3' commit.",
        hints: [
          "Type: git reflog",
          "Reflog shows every movement of HEAD",
          "Look for the entry just before the reset",
          "You can also see it in the Reflog Panel on the right",
        ],
        expectedCommands: ["git reflog"],
        validate: (_state: RepoState) => true,
      },
      {
        id: "recover-lost-commits",
        title: "Recover the Lost Work",
        instruction:
          "Use the commit hash from the reflog (shown in the Reflog Panel) to recover: copy the hash of 'Day 3' commit and run `git reset --hard <hash>`. Your work is back!",
        hints: [
          "Copy the commit hash from the Reflog Panel",
          "Run: git reset --hard <hash>",
          "Or use HEAD@{1} to reference the previous HEAD",
          "The graph will restore your commits",
        ],
        expectedCommands: ["git reset --hard"],
        validate: (state: RepoState) => {
          const active = state.activeBranch;
          if (!active) return false;
          const branch = state.branches[active];
          // Recovery succeeded if branch head is back to a later commit
          // i.e., branch head's commit has no orphaned commits after it
          return state.commits.filter((c) => c.id !== branch?.head).length >= 2;
        },
      },
    ],
  },

  // ─── Tutorial 4: Git Bisect ──────────────────────────────────────────────────
  {
    id: "find-regression",
    title: "Finding a Regression",
    description:
      "Use git bisect to perform a binary search through commit history and pinpoint exactly when your analysis pipeline broke.",
    difficulty: "advanced",
    estimatedTime: "12 min",
    icon: "🔬",
    mode: "advanced",
    steps: [
      {
        id: "build-pipeline-history",
        title: "Build a Pipeline History",
        instruction:
          "Create 5 commits simulating a pipeline that 'broke' at some point. Run git init and make 5 commits with messages: \"Setup\", \"Add preprocessing\", \"Modify normalisation\", \"Update analysis\", \"Final cleanup\"",
        hints: [
          "git init",
          "git add . && git commit -m \"Setup\"",
          "Edit file, git add . && git commit -m \"Add preprocessing\"",
          "Edit file, git add . && git commit -m \"Modify normalisation\"",
          "Edit file, git add . && git commit -m \"Update analysis\"",
          "Edit file, git add . && git commit -m \"Final cleanup\"",
        ],
        expectedCommands: ["git init", "git commit"],
        validate: (state: RepoState) => state.commits.length >= 5,
      },
      {
        id: "start-bisect",
        title: "Start the Bisect Session",
        instruction:
          "Begin bisecting: `git bisect start`. This tells git you want to find a regression.",
        hints: ["Type: git bisect start", "The bisect mode is now active"],
        expectedCommands: ["git bisect start"],
        validate: (state: RepoState) => state.bisect?.active === true,
      },
      {
        id: "mark-bad",
        title: "Mark the Current Commit as Bad",
        instruction:
          "The current HEAD (latest commit) is broken. Tell git: `git bisect bad`",
        hints: [
          "Type: git bisect bad",
          "This marks HEAD as the 'broken' end of the search",
        ],
        expectedCommands: ["git bisect bad"],
        validate: (state: RepoState) => state.bisect?.bad !== null,
      },
      {
        id: "mark-good",
        title: "Mark a Known-Good Commit",
        instruction:
          "The first commit was definitely good. Find its hash in the graph and mark it: `git bisect good <first-commit-hash>`. Or use `git bisect good HEAD~4`.",
        hints: [
          "Look at the graph for the first (oldest) commit hash",
          "Type: git bisect good <hash>  OR  git bisect good HEAD~4",
          "Git will now check out the midpoint commit for you to test",
        ],
        expectedCommands: ["git bisect good"],
        validate: (state: RepoState) =>
          (state.bisect?.good?.length ?? 0) > 0 ||
          state.bisect?.current !== null,
      },
      {
        id: "run-bisect",
        title: "Continue the Binary Search",
        instruction:
          "Git has checked out a middle commit. In real life you'd run your analysis. For this exercise, mark it as `git bisect bad` (pretend the bug is in the first half). Keep going until git finds the first bad commit.",
        hints: [
          "Run: git bisect bad  (if the checked-out commit is broken)",
          "Or: git bisect good  (if it looks fine)",
          "Repeat until git reports 'X is the first bad commit'",
          "The Reflog Panel shows your bisect progress",
        ],
        expectedCommands: ["git bisect bad", "git bisect good"],
        validate: (state: RepoState) =>
          state.bisect?.result !== null || state.reflog.length > 3,
      },
      {
        id: "end-bisect",
        title: "End the Bisect Session",
        instruction:
          "Once you've found the culprit, end the session with `git bisect reset`. This returns you to the original HEAD.",
        hints: [
          "Type: git bisect reset",
          "This cleans up the bisect state",
          "You now know exactly which commit introduced the bug",
        ],
        expectedCommands: ["git bisect reset"],
        validate: (state: RepoState) => state.bisect?.active === false,
      },
    ],
  },

  // ─── Tutorial 5: Collaborative workflow ──────────────────────────────────────
  {
    id: "feature-branch-workflow",
    title: "Feature Branch Workflow",
    description:
      "Practice a structured research workflow with feature branches, no-fast-forward merges, and squash merges for clean integration.",
    difficulty: "advanced",
    estimatedTime: "15 min",
    icon: "🔬",
    mode: "advanced",
    steps: [
      {
        id: "setup-main",
        title: "Set Up a Stable Main Branch",
        instruction:
          "Create the main branch with 2 commits representing your stable analysis: `git init`, then 2 commits.",
        hints: [
          "git init",
          "git add . && git commit -m \"Stable analysis v1\"",
          "Edit file, git add . && git commit -m \"Improve figure generation\"",
        ],
        expectedCommands: ["git init", "git commit"],
        validate: (state: RepoState) =>
          state.initialized && state.commits.length >= 2,
      },
      {
        id: "create-experiment-branch",
        title: "Create an Experiment Branch",
        instruction:
          "Create a branch for your experiment: `git branch experiment/new-normalisation` then switch to it with `git switch experiment/new-normalisation`",
        hints: [
          "Type: git branch experiment/new-normalisation",
          "Then: git switch experiment/new-normalisation",
          "Now you're isolated from the stable main branch",
        ],
        expectedCommands: ["git branch experiment", "git switch experiment"],
        validate: (state: RepoState) =>
          state.activeBranch === "experiment/new-normalisation",
      },
      {
        id: "add-experiment-commits",
        title: "Add Experiment Commits",
        instruction:
          "Make 3 commits on the experiment branch (edit the file between commits): \"WIP new normalisation\", \"fix parameters\", \"normalisation complete\"",
        hints: [
          "Edit file, git add . && git commit -m \"WIP new normalisation\"",
          "Edit file, git add . && git commit -m \"fix parameters\"",
          "Edit file, git add . && git commit -m \"normalisation complete\"",
        ],
        expectedCommands: ["git add", "git commit"],
        validate: (state: RepoState) => {
          const branch = state.branches["experiment/new-normalisation"];
          if (!branch?.head) return false;
          // Check this branch has diverged from main (has its own commits)
          return state.commits.length >= 5;
        },
      },
      {
        id: "tag-experiment",
        title: "Tag the Experiment Result",
        instruction:
          "Tag the experiment result before merging: `git tag -a exp-normalisation-v1 -m \"New normalisation method, tested on all samples\"`",
        hints: [
          "Type: git tag -a exp-normalisation-v1 -m \"New normalisation method, tested on all samples\"",
          "Tags are great checkpoints before merging",
          "You can always return to this exact state",
        ],
        expectedCommands: ["git tag -a"],
        validate: (state: RepoState) =>
          state.tags?.some((t) => t.name === "exp-normalisation-v1") ?? false,
      },
      {
        id: "merge-no-ff",
        title: "Merge with --no-ff to Preserve History",
        instruction:
          "Switch back to main and merge with --no-ff: `git switch main` then `git merge --no-ff experiment/new-normalisation`",
        hints: [
          "git switch main",
          "git merge --no-ff experiment/new-normalisation",
          "--no-ff forces a merge commit even if fast-forward is possible",
          "This preserves the evidence that the work happened on a branch",
        ],
        expectedCommands: ["git switch main", "git merge --no-ff"],
        validate: (state: RepoState) => {
          // Check that a merge commit was created
          return state.commits.some((c) => c.parents.length > 1);
        },
      },
      {
        id: "tag-release",
        title: "Tag the Merged Result",
        instruction:
          "Tag this as your new stable version: `git tag -a v2.0 -m \"Stable analysis with new normalisation method\"`",
        hints: [
          "Type: git tag -a v2.0 -m \"Stable analysis with new normalisation method\"",
          "This marks the merged result as a stable milestone",
        ],
        expectedCommands: ["git tag -a v2.0"],
        validate: (state: RepoState) =>
          state.tags?.some((t) => t.name === "v2.0") ?? false,
      },
    ],
  },
];
