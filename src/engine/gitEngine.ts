import type { RepoState, Commit, StashEntry } from "./types";

// Generate a short random ID (like a mini git hash)
const shortId = () => Math.random().toString(16).slice(2, 8);

const laneForNewBranch = (state: RepoState) => {
    const lanes = Object.values(state.branches).map((b) => b.lane);
    return lanes.length ? Math.max(...lanes) + 1 : 0;
};

const currentHeadCommit = (state: RepoState): string | null => {
    if (!state.head) return null;
    if (state.head.type === "detached") return state.head.commit;
    const b = state.branches[state.head.name];
    return b?.head ?? null;
};

// Get all commits reachable from a given commit
const getCommitAncestry = (state: RepoState, commitId: string): Set<string> => {
    const ancestry = new Set<string>();
    const stack = [commitId];
    while (stack.length > 0) {
        const id = stack.pop()!;
        if (ancestry.has(id)) continue;
        ancestry.add(id);
        const commit = state.commits.find(c => c.id === id);
        if (commit) {
            stack.push(...commit.parents);
        }
    }
    return ancestry;
};

// Find common ancestor of two commits
const findCommonAncestor = (state: RepoState, commit1: string, commit2: string): string | null => {
    const ancestry1 = getCommitAncestry(state, commit1);
    const stack = [commit2];
    const visited = new Set<string>();

    while (stack.length > 0) {
        const id = stack.pop()!;
        if (visited.has(id)) continue;
        visited.add(id);

        if (ancestry1.has(id)) return id;

        const commit = state.commits.find(c => c.id === id);
        if (commit) {
            stack.push(...commit.parents);
        }
    }
    return null;
};

// Get commits between two points (exclusive of base, inclusive of tip)
const getCommitsBetween = (state: RepoState, base: string, tip: string): Commit[] => {
    const baseAncestry = getCommitAncestry(state, base);
    const commits: Commit[] = [];
    const stack = [tip];
    const visited = new Set<string>();

    while (stack.length > 0) {
        const id = stack.pop()!;
        if (visited.has(id) || baseAncestry.has(id)) continue;
        visited.add(id);

        const commit = state.commits.find(c => c.id === id);
        if (commit) {
            commits.push(commit);
            stack.push(...commit.parents);
        }
    }

    // Return in chronological order (oldest first)
    return commits.reverse();
};

export const makeInitialState = (): RepoState => ({
    initialized: false,
    stagingCount: 0,
    commits: [],
    branches: {},
    stash: [],
    head: null,
    activeBranch: null,
    explanation: "Type a command like `git init` to begin your Git journey! Watch how the graph changes as you work.",
    workingDirectory: [
        {
            path: "main.py",
            content: `# Main application
def main():
    print("Hello, Git!")
    print("Welcome to version control")

if __name__ == "__main__":
    main()
`
        },
        {
            path: "utils.py",
            content: `# Utility functions
def format_message(msg):
    return f"[INFO] {msg}"

def validate_input(data):
    return data is not None and len(data) > 0
`
        },
        {
            path: "README.md",
            content: `# Git in Motion Project

A visual learning tool for understanding Git concepts.

## Features
- Interactive Git commands
- Real-time graph visualization
- Educational explanations
`
        }
    ],
    stagingArea: [],
    conflicts: [],
});

export type CommandResult = { ok: true } | { ok: false; error: string };

export function runCommand(state: RepoState, raw: string): CommandResult {
    const line = raw.trim();
    if (!line) return { ok: true };

    const parts = line.split(/\s+/);
    if (parts[0] !== "git") {
        state.explanation = "This demo only accepts Git commands starting with `git`. Try `git init` to start!";
        return { ok: false, error: "Not a git command — try: git init" };
    }

    const cmd = parts[1];

    // === git init ===
    if (cmd === "init") {
        if (state.initialized) {
            state.explanation = "Repository is already initialized! You can now add files and make commits.";
            return { ok: false, error: "Repository already initialized" };
        }

        state.initialized = true;
        state.branches = {
            main: { name: "main", head: null, lane: 0 },
        };
        state.head = { type: "branch", name: "main" };
        state.activeBranch = "main";
        state.stash = [];
        state.explanation = "🎉 Repository initialized! Git created a `main` branch — but it's empty until you make your first commit. The branch is just a pointer waiting to point at something.";
        return { ok: true };
    }

    if (!state.initialized) {
        state.explanation = "You need to initialize a repository first. Run `git init` to create one!";
        return { ok: false, error: "Run 'git init' first" };
    }

    // === git add ===
    if (cmd === "add") {
        const target = parts[2];

        if (!target) {
            state.explanation = "Specify what to add: `git add <file>` or `git add .` for all files.";
            return { ok: false, error: "Specify file or ." };
        }

        if (target === ".") {
            // Add all files from working directory
            state.stagingArea = state.workingDirectory.map(f => ({
                path: f.path,
                content: f.content,
                // Don't copy isConflicted flag to staging
            }));
            state.stagingCount = state.stagingArea.length;

            // Clear conflicts for added files
            const addedPaths = state.stagingArea.map(f => f.path);
            state.conflicts = state.conflicts.filter(c => !addedPaths.includes(c.path));

            if (state.conflicts.length === 0) {
                state.explanation = `📦 \`git add .\` staged all ${state.stagingArea.length} file(s)! All conflicts resolved. Ready to commit.`;
            } else {
                state.explanation = `📦 \`git add .\` staged all ${state.stagingArea.length} file(s)! The staging area is like a loading dock where you prepare what goes into your next commit. Only staged changes become part of the commit.`;
            }
        } else {
            // Add specific file
            const file = state.workingDirectory.find(f => f.path === target);
            if (!file) {
                state.explanation = `File "${target}" not found. Available files: ${state.workingDirectory.map(f => f.path).join(", ")}`;
                return { ok: false, error: `File not found: ${target}` };
            }

            // Remove from staging if already there, then add fresh copy
            state.stagingArea = state.stagingArea.filter(f => f.path !== target);
            state.stagingArea.push({
                path: file.path,
                content: file.content,
                // Don't copy isConflicted flag to staging
            });
            state.stagingCount = state.stagingArea.length;

            // Remove this file from conflicts if it was conflicted
            const wasConflicted = state.conflicts.some(c => c.path === target);
            state.conflicts = state.conflicts.filter(c => c.path !== target);

            if (wasConflicted) {
                if (state.conflicts.length === 0) {
                    state.explanation = `📦 \`git add ${target}\` staged! All conflicts resolved. Ready to commit with \`git commit -m "message"\`.`;
                } else {
                    state.explanation = `📦 \`git add ${target}\` staged! Conflict resolved for this file. ${state.conflicts.length} file(s) still have conflicts.`;
                }
            } else {
                state.explanation = `📦 \`git add ${target}\` staged! The file is now in the staging area, ready to be committed.`;
            }
        }

        return { ok: true };
    }

    // === git commit ===
    if (cmd === "commit") {
        // Check for unresolved conflicts
        if (state.conflicts.length > 0) {
            state.explanation = `⚠️ Cannot commit with unresolved conflicts! ${state.conflicts.length} file(s) still have conflicts:\n${state.conflicts.map(c => `  - ${c.path}`).join("\n")}\n\nResolve them in the File Viewer, then \`git add\` the resolved files.`;
            return { ok: false, error: "Unresolved conflicts" };
        }

        if (state.stagingCount === 0) {
            state.explanation = "Nothing to commit! Use `git add .` first to stage some changes. Git won't let you create empty commits (by default).";
            return { ok: false, error: "Nothing staged — use 'git add .' first" };
        }

        const mIndex = parts.findIndex((p) => p === "-m");
        let message = "commit";
        if (mIndex >= 0) {
            message = parts.slice(mIndex + 1).join(" ").replace(/^"|"$/g, "");
        }

        const parent = currentHeadCommit(state);
        const active = state.activeBranch;

        // Store file snapshots
        const files: Record<string, string> = {};
        for (const file of state.stagingArea) {
            files[file.path] = file.content;
        }

        // Handle detached HEAD commit
        if (!active && state.head?.type === "detached") {
            const y = state.commits.length ? Math.max(...state.commits.map((c) => c.y)) + 1 : 0;
            const commit: Commit = {
                id: shortId(),
                parents: parent ? [parent] : [],
                message,
                x: 0, // Default lane for detached commits
                y,
                files,
            };
            state.commits.push(commit);
            state.head = { type: "detached", commit: commit.id };
            state.stagingCount = 0;
            state.stagingArea = [];
            state.explanation = `⚠️ Commit created in **detached HEAD** state! This commit isn't on any branch. If you switch branches now, this commit could become "orphaned" and eventually garbage collected. Create a branch with \`git branch <name>\` to save it!`;
            return { ok: true };
        }

        if (!active) return { ok: false, error: "No active branch" };

        const activeBranch = state.branches[active];
        if (!activeBranch) return { ok: false, error: "No active branch" };

        const lane = activeBranch.lane;
        const y = state.commits.length ? Math.max(...state.commits.map((c) => c.y)) + 1 : 0;

        const commit: Commit = {
            id: shortId(),
            parents: parent ? [parent] : [],
            message,
            x: lane,
            y,
            files,
        };

        state.commits.push(commit);
        activeBranch.head = commit.id;
        state.head = { type: "branch", name: active };
        state.stagingCount = 0;
        state.stagingArea = [];

        const isFirst = state.commits.length === 1;
        if (isFirst) {
            state.explanation = `🎉 First commit created! See the purple node? That's your commit "${message}". The \`main\` branch pointer now points to it, and HEAD points to main. This is the root of your project's history!`;
        } else {
            state.explanation = `💾 New commit "${message}" created! Notice the line connecting to its parent — that's Git's history chain. Each commit knows its parent(s). The \`${active}\` branch pointer moved forward automatically.`;
        }
        return { ok: true };
    }

    // === git branch ===
    if (cmd === "branch") {
        const flag = parts[2];

        // git branch -d <name> (delete)
        if (flag === "-d" || flag === "-D") {
            const name = parts[3];
            if (!name) {
                state.explanation = "Specify a branch to delete: `git branch -d <name>`";
                return { ok: false, error: "Branch name required" };
            }
            if (!state.branches[name]) {
                state.explanation = `Branch "${name}" doesn't exist.`;
                return { ok: false, error: `No branch named '${name}'` };
            }
            if (name === state.activeBranch) {
                state.explanation = "Can't delete the branch you're currently on! Switch to another branch first.";
                return { ok: false, error: "Can't delete current branch" };
            }
            delete state.branches[name];
            state.explanation = `🗑️ Branch "${name}" deleted. Remember: deleting a branch only removes the **pointer**, not the commits themselves. The commits still exist (until Git garbage collects orphaned ones).`;
            return { ok: true };
        }

        const name = parts[2];
        if (!name) {
            const branchList = Object.keys(state.branches).map(b =>
                b === state.activeBranch ? `* ${b}` : `  ${b}`
            ).join("\n");
            state.explanation = `Current branches:\n${branchList}\n\nThe * marks your current branch. Create a new one with \`git branch <name>\`.`;
            return { ok: true };
        }

        if (state.branches[name]) {
            state.explanation = `Branch "${name}" already exists! Pick a different name.`;
            return { ok: false, error: `Branch '${name}' already exists` };
        }

        if (!currentHeadCommit(state)) {
            state.explanation = "Can't create a branch yet — you need at least one commit first! A branch needs something to point to.";
            return { ok: false, error: "Make a commit first" };
        }

        const from = currentHeadCommit(state);
        state.branches[name] = { name, head: from, lane: laneForNewBranch(state) };
        state.explanation = `🌿 Branch "${name}" created! It's just a lightweight pointer to commit \`${from}\`. Both branches now point to the same commit. Branches in Git are incredibly cheap — they're just 41-byte files containing a commit hash!`;
        return { ok: true };
    }

    // === git switch / checkout ===
    if (cmd === "switch" || cmd === "checkout") {
        const flag = parts[2];

        // git checkout <commit-hash> (detached HEAD)
        if (flag && !flag.startsWith("-") && !state.branches[flag]) {
            // Check if it's a commit hash
            const commit = state.commits.find(c => c.id === flag || c.id.startsWith(flag));
            if (commit) {
                state.head = { type: "detached", commit: commit.id };
                state.activeBranch = null;

                // Update working directory to match commit
                if (commit.files) {
                    state.workingDirectory = Object.entries(commit.files).map(([path, content]) => ({
                        path,
                        content,
                    }));
                }

                state.explanation = `⚠️ **Detached HEAD** state! You're now directly on commit \`${commit.id}\`, not on any branch. HEAD normally points to a branch, which points to a commit. Now HEAD points directly to a commit. Any new commits here won't belong to a branch!`;
                return { ok: true };
            }
        }

        const name = flag;
        if (!name) {
            const branches = Object.keys(state.branches).filter(b => b !== state.activeBranch);
            if (branches.length === 0) {
                state.explanation = "No other branches to switch to. Create one with `git branch <name>`!";
            } else {
                state.explanation = `Available branches: ${branches.join(", ")}. Try \`git switch ${branches[0]}\``;
            }
            return { ok: false, error: "Specify a branch name" };
        }

        if (!state.branches[name]) {
            // Check if it's a commit hash for detached HEAD
            const commit = state.commits.find(c => c.id === name || c.id.startsWith(name));
            if (commit) {
                state.head = { type: "detached", commit: commit.id };
                state.activeBranch = null;

                // Update working directory to match commit
                if (commit.files) {
                    state.workingDirectory = Object.entries(commit.files).map(([path, content]) => ({
                        path,
                        content,
                    }));
                }

                state.explanation = `⚠️ **Detached HEAD**! You checked out commit \`${commit.id}\` directly. You're not on any branch now.`;
                return { ok: true };
            }
            state.explanation = `Branch "${name}" doesn't exist. Create it first with \`git branch ${name}\`.`;
            return { ok: false, error: `No branch named '${name}'` };
        }

        if (name === state.activeBranch) {
            state.explanation = `You're already on "${name}"! Try switching to a different branch.`;
            return { ok: false, error: `Already on '${name}'` };
        }

        state.head = { type: "branch", name };
        state.activeBranch = name;

        // Update working directory to match branch's HEAD commit
        const branch = state.branches[name];
        if (branch?.head) {
            const commit = state.commits.find(c => c.id === branch.head);
            if (commit?.files) {
                state.workingDirectory = Object.entries(commit.files).map(([path, content]) => ({
                    path,
                    content,
                }));
            }
        }

        state.explanation = `🔀 Switched to "${name}"! HEAD now points to the \`${name}\` branch. Notice: the commits didn't move — switching branches just changes which branch HEAD points to. It's like changing which bookmark you're looking at.`;
        return { ok: true };
    }

    // === git merge ===
    if (cmd === "merge") {
        const flag = parts[2];

        // git merge --abort
        if (flag === "--abort") {
            if (state.conflicts.length === 0) {
                state.explanation = "No merge in progress.";
                return { ok: false, error: "No merge to abort" };
            }

            // Clear conflicts
            state.conflicts = [];

            // Restore working directory to HEAD
            const headCommit = currentHeadCommit(state);
            if (headCommit) {
                const commit = state.commits.find(c => c.id === headCommit);
                if (commit?.files) {
                    state.workingDirectory = Object.entries(commit.files).map(([path, content]) => ({
                        path,
                        content,
                    }));
                }
            }

            state.explanation = "🚫 Merge aborted. Working directory restored to HEAD state.";
            return { ok: true };
        }

        const other = flag;
        const active = state.activeBranch;

        if (!other) {
            const branches = Object.keys(state.branches).filter(b => b !== active);
            if (branches.length === 0) {
                state.explanation = "No branches to merge. Create another branch first!";
            } else {
                state.explanation = `Which branch do you want to merge? Try \`git merge ${branches[0]}\``;
            }
            return { ok: false, error: "Specify branch to merge" };
        }

        if (!active) {
            state.explanation = "Can't merge in detached HEAD state. Switch to a branch first!";
            return { ok: false, error: "Not on a branch" };
        }

        if (!state.branches[other]) {
            state.explanation = `Branch "${other}" doesn't exist.`;
            return { ok: false, error: `No branch named '${other}'` };
        }

        if (other === active) {
            state.explanation = "You can't merge a branch into itself!";
            return { ok: false, error: "Can't merge branch into itself" };
        }

        const activeBranch = state.branches[active];
        const otherBranch = state.branches[other];

        if (!activeBranch || !otherBranch) {
            return { ok: false, error: "Branch not found" };
        }

        const aHead = activeBranch.head;
        const bHead = otherBranch.head;

        if (!aHead || !bHead) {
            state.explanation = "Both branches need commits before you can merge.";
            return { ok: false, error: "Both branches need commits" };
        }

        // Check for fast-forward possibility
        const aAncestry = getCommitAncestry(state, aHead);
        const bAncestry = getCommitAncestry(state, bHead);

        if (aAncestry.has(bHead)) {
            state.explanation = `Already up to date! \`${other}\` is an ancestor of \`${active}\`.`;
            return { ok: true };
        }

        if (bAncestry.has(aHead)) {
            // Fast-forward merge!
            activeBranch.head = bHead;

            // Update working directory to match merged commit
            const mergedCommit = state.commits.find(c => c.id === bHead);
            if (mergedCommit?.files) {
                state.workingDirectory = Object.entries(mergedCommit.files).map(([path, content]) => ({
                    path,
                    content,
                }));
            }

            state.explanation = `⚡ **Fast-forward merge!** Since \`${active}\` was an ancestor of \`${other}\`, Git just moved the \`${active}\` pointer forward. No merge commit needed! This is the cleanest type of merge — it's like the branch never diverged.`;
            return { ok: true };
        }

        // Regular merge - check for conflicts
        const aCommit = state.commits.find(c => c.id === aHead);
        const bCommit = state.commits.find(c => c.id === bHead);

        if (!aCommit?.files || !bCommit?.files) {
            state.explanation = "Cannot merge — commits missing file information.";
            return { ok: false, error: "Missing file data" };
        }

        // Detect conflicts
        const conflicts: typeof state.conflicts = [];
        const mergedFiles: Record<string, string> = {};

        // Get all file paths from both commits
        const allPaths = new Set([...Object.keys(aCommit.files), ...Object.keys(bCommit.files)]);

        for (const path of allPaths) {
            const aContent = aCommit.files[path];
            const bContent = bCommit.files[path];

            if (aContent === undefined) {
                // File only in other branch
                mergedFiles[path] = bContent!;
            } else if (bContent === undefined) {
                // File only in current branch
                mergedFiles[path] = aContent;
            } else if (aContent === bContent) {
                // Same content
                mergedFiles[path] = aContent;
            } else {
                // CONFLICT!
                conflicts.push({
                    path,
                    ours: aContent,
                    theirs: bContent,
                });

                // Create conflict markers in file
                mergedFiles[path] = `<<<<<<< HEAD (${active})\n${aContent}\n=======\n${bContent}\n>>>>>>> ${other}\n`;
            }
        }

        if (conflicts.length > 0) {
            // Merge has conflicts
            state.conflicts = conflicts;
            state.workingDirectory = Object.entries(mergedFiles).map(([path, content]) => ({
                path,
                content,
                isConflicted: conflicts.some(c => c.path === path),
            }));

            state.explanation = `⚠️ **Merge conflict!** ${conflicts.length} file(s) have conflicts:\n${conflicts.map(c => `  - ${c.path}`).join("\n")}\n\nResolve conflicts in the File Viewer, then \`git add\` and \`git commit\` to complete the merge. Or use \`git merge --abort\` to cancel.`;
            return { ok: false, error: "Merge conflicts" };
        }

        // No conflicts - create merge commit
        const lane = activeBranch.lane;
        const y = Math.max(...state.commits.map((c) => c.y)) + 1;

        const mergeCommit: Commit = {
            id: shortId(),
            parents: [aHead, bHead],
            message: `Merge ${other} → ${active}`,
            x: lane,
            y,
            files: mergedFiles,
        };

        state.commits.push(mergeCommit);
        activeBranch.head = mergeCommit.id;

        // Update working directory
        state.workingDirectory = Object.entries(mergedFiles).map(([path, content]) => ({
            path,
            content,
        }));

        state.explanation = `🔗 **Merge commit created!** This commit has TWO parents — one from \`${active}\` and one from \`${other}\`. The merge commit records the point where two lines of development joined. Both histories are preserved!`;
        return { ok: true };
    }

    // === git rebase ===
    if (cmd === "rebase") {
        const onto = parts[2];
        const active = state.activeBranch;

        if (!onto) {
            state.explanation = "Specify the branch to rebase onto: `git rebase <branch>`. This will replay your commits on top of that branch.";
            return { ok: false, error: "Specify target branch" };
        }

        if (!active) {
            state.explanation = "Can't rebase in detached HEAD state. Switch to a branch first!";
            return { ok: false, error: "Not on a branch" };
        }

        if (!state.branches[onto]) {
            state.explanation = `Branch "${onto}" doesn't exist.`;
            return { ok: false, error: `No branch named '${onto}'` };
        }

        if (onto === active) {
            state.explanation = "Can't rebase a branch onto itself!";
            return { ok: false, error: "Can't rebase onto self" };
        }

        const activeBranch = state.branches[active];
        const ontoBranch = state.branches[onto];

        if (!activeBranch?.head || !ontoBranch?.head) {
            state.explanation = "Both branches need commits to rebase.";
            return { ok: false, error: "Both branches need commits" };
        }

        // Find common ancestor
        const commonAncestor = findCommonAncestor(state, activeBranch.head, ontoBranch.head);
        if (!commonAncestor) {
            state.explanation = "Can't find common ancestor between branches.";
            return { ok: false, error: "No common ancestor" };
        }

        // Get commits to replay (from current branch, after common ancestor)
        const commitsToReplay = getCommitsBetween(state, commonAncestor, activeBranch.head);

        if (commitsToReplay.length === 0) {
            state.explanation = `Nothing to rebase — \`${active}\` has no new commits since diverging from \`${onto}\`.`;
            return { ok: true };
        }

        // Check if already rebased (onto is ancestor of active)
        const ontoAncestry = getCommitAncestry(state, ontoBranch.head);
        if (ontoAncestry.has(activeBranch.head)) {
            state.explanation = `Already up to date — \`${active}\` is already based on \`${onto}\`.`;
            return { ok: true };
        }

        // Replay commits onto the target branch
        let currentParent = ontoBranch.head;
        const newCommits: Commit[] = [];
        const ontoLane = ontoBranch.lane;
        let y = Math.max(...state.commits.map((c) => c.y)) + 1;

        for (const oldCommit of commitsToReplay) {
            const newCommit: Commit = {
                id: shortId(),
                parents: [currentParent],
                message: oldCommit.message,
                x: ontoLane,
                y: y++,
                isRebase: true,
                originalId: oldCommit.id,
                files: oldCommit.files, // Copy files from original commit
            };
            newCommits.push(newCommit);
            state.commits.push(newCommit);
            currentParent = newCommit.id;
        }

        // Move branch pointer to new tip
        activeBranch.head = currentParent;
        activeBranch.lane = ontoLane; // Move branch to same lane

        // Update working directory to match new tip
        const newTip = state.commits.find(c => c.id === currentParent);
        if (newTip?.files) {
            state.workingDirectory = Object.entries(newTip.files).map(([path, content]) => ({
                path,
                content,
            }));
        }

        state.explanation = `🔄 **Rebase complete!** ${commitsToReplay.length} commit(s) were "replayed" on top of \`${onto}\`. The old commits still exist but are now orphaned (shown faded). Notice: same changes, NEW commit hashes! Rebase rewrites history — the commits are technically different objects. This creates a linear history without merge commits.`;
        return { ok: true };
    }

    // === git reset ===
    if (cmd === "reset") {
        const flag = parts[2];
        let mode: "soft" | "mixed" | "hard" = "mixed";
        let target = parts[2];

        if (flag === "--soft") {
            mode = "soft";
            target = parts[3];
        } else if (flag === "--mixed" || flag === undefined) {
            mode = "mixed";
            target = flag === "--mixed" ? parts[3] : parts[2];
        } else if (flag === "--hard") {
            mode = "hard";
            target = parts[3];
        }

        if (!target) {
            // Default to HEAD~1 (parent of current commit)
            const current = currentHeadCommit(state);
            if (!current) {
                state.explanation = "Nothing to reset — no commits yet.";
                return { ok: false, error: "No commits" };
            }
            const commit = state.commits.find(c => c.id === current);
            if (!commit || commit.parents.length === 0) {
                state.explanation = "Can't reset — this is the first commit.";
                return { ok: false, error: "No parent commit" };
            }
            target = commit.parents[0];
        }

        // Handle HEAD~n syntax
        if (target && target.startsWith("HEAD~")) {
            const n = parseInt(target.slice(5)) || 1;
            let current: string | null = currentHeadCommit(state);
            for (let i = 0; i < n && current; i++) {
                const commit = state.commits.find(c => c.id === current);
                if (!commit || commit.parents.length === 0) break;
                current = commit.parents[0] ?? null;
            }
            if (!current) {
                state.explanation = `Can't go back ${n} commits — not enough history.`;
                return { ok: false, error: "Not enough commits" };
            }
            target = current;
        }

        // Ensure target is defined at this point
        if (!target) {
            state.explanation = "No target commit specified.";
            return { ok: false, error: "No target specified" };
        }

        // Find target commit
        const targetCommit = state.commits.find(c => c.id === target || c.id.startsWith(target));
        if (!targetCommit) {
            state.explanation = `Commit "${target}" not found.`;
            return { ok: false, error: "Commit not found" };
        }

        const active = state.activeBranch;
        if (!active) {
            // Detached HEAD reset
            state.head = { type: "detached", commit: targetCommit.id };
            state.explanation = `Reset HEAD to \`${targetCommit.id}\` (${mode} mode). In detached HEAD state.`;
            return { ok: true };
        }

        const activeBranch = state.branches[active];
        if (!activeBranch) return { ok: false, error: "No active branch" };

        // Move branch pointer
        activeBranch.head = targetCommit.id;

        if (mode === "soft") {
            // Keep staging area
            state.explanation = `⏪ **Soft reset** to \`${targetCommit.id}\`! The branch pointer moved back, but your staged changes are preserved. The "undone" commits' changes are now in your staging area, ready to be recommitted differently. Great for combining commits!`;
        } else if (mode === "mixed") {
            // Clear staging area
            state.stagingCount = 0;
            state.stagingArea = [];
            state.explanation = `⏪ **Mixed reset** (default) to \`${targetCommit.id}\`! The branch pointer moved back AND the staging area was cleared. The changes from undone commits are still in your working directory, just unstaged. Use this to redo your staging.`;
        } else {
            // Hard reset - clear everything
            state.stagingCount = 0;
            state.stagingArea = [];

            // Update working directory to match target commit
            if (targetCommit.files) {
                state.workingDirectory = Object.entries(targetCommit.files).map(([path, content]) => ({
                    path,
                    content,
                }));
            }

            state.explanation = `⚠️ **Hard reset** to \`${targetCommit.id}\`! The branch pointer moved back, staging area cleared, AND working directory changes discarded. This is DANGEROUS — those changes are gone! Use this only when you want to truly abandon work.`;
        }
        return { ok: true };
    }

    // === git revert ===
    if (cmd === "revert") {
        const target = parts[2];
        const active = state.activeBranch;

        if (!target) {
            state.explanation = "Specify which commit to revert: `git revert <commit>`. This creates a NEW commit that undoes the changes.";
            return { ok: false, error: "Specify commit to revert" };
        }

        if (!active) {
            state.explanation = "Can't revert in detached HEAD state. Switch to a branch first!";
            return { ok: false, error: "Not on a branch" };
        }

        const targetCommit = state.commits.find(c => c.id === target || c.id.startsWith(target));
        if (!targetCommit) {
            state.explanation = `Commit "${target}" not found.`;
            return { ok: false, error: "Commit not found" };
        }

        const activeBranch = state.branches[active];
        if (!activeBranch?.head) return { ok: false, error: "No commits on branch" };

        const y = Math.max(...state.commits.map((c) => c.y)) + 1;

        const revertCommit: Commit = {
            id: shortId(),
            parents: [activeBranch.head],
            message: `Revert "${targetCommit.message}"`,
            x: activeBranch.lane,
            y,
            isRevert: true,
            originalId: targetCommit.id,
        };

        state.commits.push(revertCommit);
        activeBranch.head = revertCommit.id;

        state.explanation = `↩️ **Revert commit created!** Unlike reset, revert is SAFE — it creates a new commit that undoes the changes from \`${targetCommit.id}\`. History is preserved! This is the preferred way to undo changes that have been shared with others.`;
        return { ok: true };
    }

    // === git cherry-pick ===
    if (cmd === "cherry-pick") {
        const target = parts[2];
        const active = state.activeBranch;

        if (!target) {
            state.explanation = "Specify which commit to cherry-pick: `git cherry-pick <commit>`. This copies a commit to your current branch.";
            return { ok: false, error: "Specify commit" };
        }

        if (!active) {
            state.explanation = "Can't cherry-pick in detached HEAD state.";
            return { ok: false, error: "Not on a branch" };
        }

        const targetCommit = state.commits.find(c => c.id === target || c.id.startsWith(target));
        if (!targetCommit) {
            state.explanation = `Commit "${target}" not found.`;
            return { ok: false, error: "Commit not found" };
        }

        const activeBranch = state.branches[active];
        if (!activeBranch) return { ok: false, error: "No active branch" };

        const parent = activeBranch.head;
        const y = state.commits.length ? Math.max(...state.commits.map((c) => c.y)) + 1 : 0;

        const cherryCommit: Commit = {
            id: shortId(),
            parents: parent ? [parent] : [],
            message: targetCommit.message,
            x: activeBranch.lane,
            y,
            isCherryPick: true,
            originalId: targetCommit.id,
            files: targetCommit.files, // Copy files from target commit
        };

        state.commits.push(cherryCommit);
        activeBranch.head = cherryCommit.id;

        // Update working directory to match cherry-picked commit
        if (cherryCommit.files) {
            state.workingDirectory = Object.entries(cherryCommit.files).map(([path, content]) => ({
                path,
                content,
            }));
        }

        state.explanation = `🍒 **Cherry-pick complete!** Commit \`${targetCommit.id}\` was copied to \`${active}\` as a NEW commit \`${cherryCommit.id}\`. Same changes, different commit! Cherry-pick lets you selectively apply individual commits from anywhere in your history.`;
        return { ok: true };
    }

    // === git stash ===
    if (cmd === "stash") {
        const subCmd = parts[2];

        if (!subCmd || subCmd === "push") {
            if (state.stagingCount === 0) {
                state.explanation = "Nothing to stash — no staged changes.";
                return { ok: false, error: "Nothing to stash" };
            }

            const message = parts.slice(3).join(" ").replace(/^-m\s*/, "").replace(/^"|"$/g, "") || `WIP on ${state.activeBranch}`;

            const entry: StashEntry = {
                id: shortId(),
                message,
                fromBranch: state.activeBranch || "detached",
                fromCommit: currentHeadCommit(state),
                stagingCount: state.stagingCount,
                files: state.stagingArea.map(f => ({ ...f })),
            };

            state.stash.unshift(entry); // Push to front (stack)
            state.stagingCount = 0;
            state.stagingArea = [];

            state.explanation = `📦 **Stashed!** Your staged changes are saved in stash@{0}. The working directory is now clean. Stash is like a clipboard — you can switch branches, do other work, then come back and \`git stash pop\` to restore your changes.`;
            return { ok: true };
        }

        if (subCmd === "pop") {
            if (state.stash.length === 0) {
                state.explanation = "Stash is empty — nothing to pop.";
                return { ok: false, error: "No stash entries" };
            }

            const entry = state.stash.shift()!;
            state.stagingCount = entry.stagingCount;

            if (entry.files) {
                state.stagingArea = entry.files.map(f => ({ ...f }));
            }

            state.explanation = `📤 **Stash popped!** Restored ${entry.stagingCount} staged change(s) from "${entry.message}". The stash entry is removed. Your changes are back in the staging area!`;
            return { ok: true };
        }

        if (subCmd === "list") {
            if (state.stash.length === 0) {
                state.explanation = "Stash is empty.";
            } else {
                const list = state.stash.map((s, i) => `stash@{${i}}: ${s.message}`).join("\n");
                state.explanation = `Stash list:\n${list}\n\nUse \`git stash pop\` to restore the latest, or \`git stash drop\` to remove it.`;
            }
            return { ok: true };
        }

        if (subCmd === "drop") {
            if (state.stash.length === 0) {
                state.explanation = "Stash is empty — nothing to drop.";
                return { ok: false, error: "No stash entries" };
            }

            const entry = state.stash.shift()!;
            state.explanation = `🗑️ Dropped stash@{0}: "${entry.message}". The stashed changes are gone.`;
            return { ok: true };
        }

        if (subCmd === "clear") {
            const count = state.stash.length;
            state.stash = [];
            state.explanation = `🗑️ Cleared all ${count} stash entries.`;
            return { ok: true };
        }

        state.explanation = `Unknown stash command. Try: \`git stash\`, \`git stash pop\`, \`git stash list\`, \`git stash drop\``;
        return { ok: false, error: "Unknown stash command" };
    }

    // === git log ===
    if (cmd === "log") {
        const count = state.commits.length;
        if (count === 0) {
            state.explanation = "No commits yet! The log is empty.";
        } else {
            const rebaseCount = state.commits.filter(c => c.isRebase).length;
            const revertCount = state.commits.filter(c => c.isRevert).length;
            const mergeCount = state.commits.filter(c => c.parents.length > 1).length;
            const cherryCount = state.commits.filter(c => c.isCherryPick).length;

            let details = `${count} total commits`;
            if (mergeCount) details += `, ${mergeCount} merge(s)`;
            if (rebaseCount) details += `, ${rebaseCount} rebased`;
            if (revertCount) details += `, ${revertCount} revert(s)`;
            if (cherryCount) details += `, ${cherryCount} cherry-pick(s)`;

            state.explanation = `📜 ${details}. The graph shows your project's history — each node is a commit, lines show parent relationships.`;
        }
        return { ok: true };
    }

    // === git status ===
    if (cmd === "status") {
        const branchInfo = state.activeBranch
            ? `On branch \`${state.activeBranch}\``
            : state.head?.type === "detached"
                ? `HEAD detached at \`${state.head.commit}\``
                : "No branch";

        let fileInfo = "";

        // Show conflicts
        if (state.conflicts.length > 0) {
            fileInfo += `\n⚠️ ${state.conflicts.length} file(s) with conflicts:\n`;
            fileInfo += state.conflicts.map(c => `  - ${c.path}`).join("\n");
        }

        // Show staged files
        if (state.stagingArea.length > 0) {
            fileInfo += `\n📦 ${state.stagingArea.length} file(s) staged:\n`;
            fileInfo += state.stagingArea.map(f => `  - ${f.path}`).join("\n");
        } else {
            fileInfo += "\nNothing staged";
        }

        // Show modified files (compare working directory to HEAD)
        const headCommit = currentHeadCommit(state);
        if (headCommit) {
            const commit = state.commits.find(c => c.id === headCommit);
            const modified: string[] = [];

            if (commit?.files) {
                for (const file of state.workingDirectory) {
                    const headContent = commit.files[file.path];
                    if (headContent !== undefined && headContent !== file.content) {
                        modified.push(file.path);
                    }
                }
            }

            if (modified.length > 0) {
                fileInfo += `\n✏️  ${modified.length} file(s) modified:\n`;
                fileInfo += modified.map(p => `  - ${p}`).join("\n");
            }
        }

        const stashInfo = state.stash.length > 0
            ? `\n📦 ${state.stash.length} stash entry(ies)`
            : "";

        state.explanation = `${branchInfo}${fileInfo}${stashInfo}`;
        return { ok: true };
    }

    // === git diff ===
    if (cmd === "diff") {
        const target = parts[2];
        const headCommit = currentHeadCommit(state);

        if (!headCommit) {
            state.explanation = "No commits yet — nothing to diff against.";
            return { ok: false, error: "No commits" };
        }

        const commit = state.commits.find(c => c.id === headCommit);
        if (!commit?.files) {
            state.explanation = "Current commit has no files.";
            return { ok: false, error: "No files in commit" };
        }

        if (target) {
            // Show diff for specific file
            const workingFile = state.workingDirectory.find(f => f.path === target);
            const headContent = commit.files[target];

            if (!workingFile || headContent === undefined) {
                state.explanation = `File "${target}" not found.`;
                return { ok: false, error: "File not found" };
            }

            if (workingFile.content === headContent) {
                state.explanation = `No changes in ${target}.`;
            } else {
                state.explanation = `📝 ${target} has been modified since the last commit. Check the file viewer to see changes.`;
            }
        } else {
            // Show all modified files
            const modified: string[] = [];
            for (const file of state.workingDirectory) {
                const headContent = commit.files[file.path];
                if (headContent !== undefined && headContent !== file.content) {
                    modified.push(file.path);
                }
            }

            if (modified.length === 0) {
                state.explanation = "No changes since last commit.";
            } else {
                state.explanation = `📝 ${modified.length} file(s) modified:\n${modified.map(p => `  - ${p}`).join("\n")}\n\nUse \`git diff <file>\` to see changes in a specific file.`;
            }
        }

        return { ok: true };
    }

    // === Unknown command ===
    state.explanation = `Command \`git ${cmd}\` isn't implemented. Available commands:\n• init, add, commit, branch, switch/checkout\n• merge, rebase, reset, revert, cherry-pick\n• stash, log, status, diff`;
    return { ok: false, error: `Unknown: ${cmd}` };
}
