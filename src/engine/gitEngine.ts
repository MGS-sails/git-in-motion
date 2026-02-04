import type { RepoState, Commit } from "./types";

// tiny id helper (no deps)
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
    explanation: "Type a command like: git init",
});

export type CommandResult = { ok: true } | { ok: false; error: string };

export function runCommand(state: RepoState, raw: string): CommandResult {
    const line = raw.trim();
    if (!line) return { ok: true };

    const parts = line.split(/\s+/);
    if (parts[0] !== "git") {
        state.explanation = "This demo accepts commands starting with `git ...`";
        return { ok: false, error: "Not a git command" };
    }

    const cmd = parts[1];

    // --- git init
    if (cmd === "init") {
        state.initialized = true;
        state.branches = {
            main: { name: "main", head: null, lane: 0 },
        };
        state.head = { type: "branch", name: "main" };
        state.activeBranch = "main";
        state.explanation = "Initialized empty repository. `main` is a pointer (label) to a commit.";
        return { ok: true };
    }

    if (!state.initialized) {
        state.explanation = "Run `git init` first.";
        return { ok: false, error: "Repo not initialized" };
    }

    // --- git add .
    if (cmd === "add") {
        state.stagingCount = Math.max(1, state.stagingCount + 1);
        state.explanation = "`git add` puts changes into the staging area (what will go into the next commit).";
        return { ok: true };
    }

    // --- git commit -m "msg"
    if (cmd === "commit") {
        const mIndex = parts.findIndex((p) => p === "-m");
        const message =
            mIndex >= 0 ? parts.slice(mIndex + 1).join(" ").replace(/^"|"$/g, "") : "commit";

        const parent = currentHeadCommit(state);
        const active = state.activeBranch;
        if (!active) return { ok: false, error: "No active branch" };

        const lane = state.branches[active].lane;
        const y = state.commits.length ? Math.max(...state.commits.map((c) => c.y)) + 1 : 0;

        const commit: Commit = {
            id: shortId(),
            parents: parent ? [parent] : [],
            message,
            x: lane,
            y,
        };

        state.commits.push(commit);
        state.branches[active].head = commit.id;
        state.head = { type: "branch", name: active };

        state.stagingCount = 0;
        state.explanation = "A commit is a snapshot node in the graph. Branch pointers move to the new commit.";
        return { ok: true };
    }

    // --- git branch <name>
    if (cmd === "branch") {
        const name = parts[2];
        if (!name) {
            state.explanation = `Branches: ${Object.keys(state.branches).join(", ")}`;
            return { ok: true };
        }
        if (state.branches[name]) return { ok: false, error: "Branch already exists" };

        const from = currentHeadCommit(state);
        state.branches[name] = { name, head: from, lane: laneForNewBranch(state) };
        state.explanation = "A branch is just a label pointing to a commit. It’s cheap to create.";
        return { ok: true };
    }

    // --- git switch <name>  (or checkout)
    if (cmd === "switch" || cmd === "checkout") {
        const name = parts[2];
        if (!name) return { ok: false, error: "Branch name required" };
        if (!state.branches[name]) return { ok: false, error: "No such branch" };

        state.head = { type: "branch", name };
        state.activeBranch = name;
        state.explanation = "`HEAD` points to your current branch. Switching moves HEAD (not commits).";
        return { ok: true };
    }

    // --- git merge <branch>
    if (cmd === "merge") {
        const other = parts[2];
        const active = state.activeBranch;
        if (!other) return { ok: false, error: "Branch to merge required" };
        if (!active) return { ok: false, error: "No active branch" };
        if (!state.branches[other]) return { ok: false, error: "No such branch" };
        if (other === active) return { ok: false, error: "Cannot merge branch into itself" };

        const aHead = state.branches[active].head;
        const bHead = state.branches[other].head;
        if (!aHead || !bHead) return { ok: false, error: "Need commits on both branches" };

        const lane = state.branches[active].lane;
        const y = Math.max(...state.commits.map((c) => c.y)) + 1;

        const mergeCommit: Commit = {
            id: shortId(),
            parents: [aHead, bHead],
            message: `merge ${other} into ${active}`,
            x: lane,
            y,
        };

        state.commits.push(mergeCommit);
        state.branches[active].head = mergeCommit.id;
        state.explanation = "Merge creates a commit with TWO parents: it records history joining.";
        return { ok: true };
    }

    // --- git log (just explanation in MVP)
    if (cmd === "log") {
        state.explanation = "Log shows commit history (this demo focuses on the graph and pointers).";
        return { ok: true };
    }

    state.explanation = `Command not implemented in demo: ${cmd}`;
    return { ok: false, error: "Not implemented" };
}
