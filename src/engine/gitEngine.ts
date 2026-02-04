import type { RepoState, Commit } from "./types";

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

export const makeInitialState = (): RepoState => ({
    initialized: false,
    stagingCount: 0,
    commits: [],
    branches: {},
    head: null,
    activeBranch: null,
    explanation: "Type a command like `git init` to begin your Git journey! Watch how the graph changes as you work.",
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

    // --- git init
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
        state.explanation = "Repository initialized! Git created a `main` branch — but it's empty until you make your first commit. The branch is just a pointer waiting to point at something.";
        return { ok: true };
    }

    if (!state.initialized) {
        state.explanation = "You need to initialize a repository first. Run `git init` to create one!";
        return { ok: false, error: "Run 'git init' first" };
    }

    // --- git add .
    if (cmd === "add") {
        state.stagingCount = Math.max(1, state.stagingCount + 1);
        state.explanation = "`git add` moves changes into the staging area — think of it as preparing ingredients before cooking. Staged changes will be included in your next commit.";
        return { ok: true };
    }

    // --- git commit -m "msg"
    if (cmd === "commit") {
        if (state.stagingCount === 0) {
            state.explanation = "Nothing to commit! Use `git add .` first to stage some changes. Git won't let you create empty commits.";
            return { ok: false, error: "Nothing staged — use 'git add .' first" };
        }

        const mIndex = parts.findIndex((p) => p === "-m");
        let message = "commit";
        if (mIndex >= 0) {
            message = parts.slice(mIndex + 1).join(" ").replace(/^"|"$/g, "");
        }

        const parent = currentHeadCommit(state);
        const active = state.activeBranch;
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
        };

        state.commits.push(commit);
        activeBranch.head = commit.id;
        state.head = { type: "branch", name: active };
        state.stagingCount = 0;

        const isFirst = state.commits.length === 1;
        if (isFirst) {
            state.explanation = `First commit created! 🎉 See the purple node? That's your commit "${message}". The \`main\` branch pointer now points to it, and HEAD points to main.`;
        } else {
            state.explanation = `New commit "${message}" created! Notice how it connects to its parent — that's Git's history chain. The \`${active}\` branch moved forward to point at this new commit.`;
        }
        return { ok: true };
    }

    // --- git branch <name>
    if (cmd === "branch") {
        const name = parts[2];
        if (!name) {
            const branchList = Object.keys(state.branches).join(", ");
            state.explanation = `Current branches: ${branchList}. Create a new one with \`git branch <name>\`.`;
            return { ok: true };
        }

        if (state.branches[name]) {
            state.explanation = `Branch "${name}" already exists! Pick a different name.`;
            return { ok: false, error: `Branch '${name}' already exists` };
        }

        if (!currentHeadCommit(state)) {
            state.explanation = "Can't create a branch yet — you need at least one commit first!";
            return { ok: false, error: "Make a commit first" };
        }

        const from = currentHeadCommit(state);
        state.branches[name] = { name, head: from, lane: laneForNewBranch(state) };
        state.explanation = `Branch "${name}" created! 🌿 It's just a lightweight pointer to commit ${from}. Branches cost almost nothing to create — they're just 41-byte files!`;
        return { ok: true };
    }

    // --- git switch <name> (or checkout)
    if (cmd === "switch" || cmd === "checkout") {
        const name = parts[2];
        if (!name) {
            const branches = Object.keys(state.branches).filter(b => b !== state.activeBranch);
            if (branches.length === 0) {
                state.explanation = "No other branches to switch to. Create one with `git branch <name>`!";
            } else {
                state.explanation = `Available branches to switch: ${branches.join(", ")}. Try \`git switch ${branches[0]}\``;
            }
            return { ok: false, error: "Specify a branch name" };
        }

        if (!state.branches[name]) {
            state.explanation = `Branch "${name}" doesn't exist. Create it first with \`git branch ${name}\`.`;
            return { ok: false, error: `No branch named '${name}'` };
        }

        if (name === state.activeBranch) {
            state.explanation = `You're already on "${name}"! Try switching to a different branch.`;
            return { ok: false, error: `Already on '${name}'` };
        }

        state.head = { type: "branch", name };
        state.activeBranch = name;
        state.explanation = `Switched to "${name}"! 🔀 See how HEAD moved? It now points to the \`${name}\` branch. The commits didn't move — only your view of them changed.`;
        return { ok: true };
    }

    // --- git merge <branch>
    if (cmd === "merge") {
        const other = parts[2];
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

        if (!active) return { ok: false, error: "No active branch" };

        if (!state.branches[other]) {
            state.explanation = `Branch "${other}" doesn't exist. Check your branches with \`git branch\`.`;
            return { ok: false, error: `No branch named '${other}'` };
        }

        if (other === active) {
            state.explanation = "You can't merge a branch into itself! Switch to a different branch first.";
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
            state.explanation = "Both branches need commits before you can merge. Make some commits first!";
            return { ok: false, error: "Both branches need commits" };
        }

        // Check if already merged (simple check)
        if (aHead === bHead) {
            state.explanation = `Already up to date! Both branches point to the same commit.`;
            return { ok: true };
        }

        const lane = activeBranch.lane;
        const y = Math.max(...state.commits.map((c) => c.y)) + 1;

        const mergeCommit: Commit = {
            id: shortId(),
            parents: [aHead, bHead],
            message: `Merge ${other} → ${active}`,
            x: lane,
            y,
        };

        state.commits.push(mergeCommit);
        activeBranch.head = mergeCommit.id;
        state.explanation = `Merge complete! 🔗 Notice the new commit has TWO parent lines — one from \`${active}\` and one from \`${other}\`. This records where the branches joined. The merge commit shows the pink color because it's special!`;
        return { ok: true };
    }

    // --- git log
    if (cmd === "log") {
        const count = state.commits.length;
        if (count === 0) {
            state.explanation = "No commits yet! The log is empty. Create your first commit.";
        } else {
            state.explanation = `You have ${count} commit${count > 1 ? 's' : ''} in the repository. The graph shows them visually — each node is a commit, connected to its parent(s).`;
        }
        return { ok: true };
    }

    // --- git status
    if (cmd === "status") {
        const branchInfo = state.activeBranch ? `On branch \`${state.activeBranch}\`` : "No branch";
        const stagingInfo = state.stagingCount > 0
            ? `${state.stagingCount} change${state.stagingCount > 1 ? 's' : ''} staged for commit`
            : "Nothing staged";
        state.explanation = `${branchInfo}. ${stagingInfo}. ${state.commits.length} total commits.`;
        return { ok: true };
    }

    // --- Unknown command
    state.explanation = `Command \`git ${cmd}\` isn't implemented in this demo. Try: init, add, commit, branch, switch, merge, log, or status.`;
    return { ok: false, error: `Unknown command: ${cmd}` };
}
