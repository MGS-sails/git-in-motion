export type FileContent = {
    path: string;           // e.g., "main.py", "utils.py"
    content: string;        // File content as string
    isConflicted?: boolean; // Has unresolved conflicts
};

export type ConflictMarkers = {
    path: string;
    ours: string;      // Content from current branch (HEAD)
    theirs: string;    // Content from merging branch
};

export type Commit = {
    id: string;
    parents: string[];
    message: string;
    x: number; // lane
    y: number; // depth
    isRebase?: boolean;    // Was this commit created by a rebase?
    isRevert?: boolean;    // Was this commit created by a revert?
    isCherryPick?: boolean; // Was this commit created by cherry-pick?
    originalId?: string;   // Original commit ID if rebased/cherry-picked
    files?: Record<string, string>; // File snapshots
};

export type Branch = {
    name: string;
    head: string | null;
    lane: number;
};

export type StashEntry = {
    id: string;
    message: string;
    fromBranch: string;
    fromCommit: string | null;
    stagingCount: number;
    files?: FileContent[]; // Stashed files
};

// === Advanced types ===

export type Tag = {
    name: string;
    commitId: string;
    message?: string;    // Only for annotated tags
    isAnnotated: boolean;
};

export type ReflogEntry = {
    commitId: string | null; // Commit HEAD pointed to at this moment
    headRef: string;         // Branch name or "HEAD" (detached)
    action: string;          // "commit", "reset", "checkout", "merge", "rebase", etc.
    message: string;         // Full human-readable reflog message
    index: number;           // HEAD@{index}
};

export type BisectState = {
    active: boolean;
    bad: string | null;       // Known bad commit
    good: string[];           // Known good commits
    remaining: string[];      // Commits still to test (ordered)
    current: string | null;   // Commit currently being tested
    result: string | null;    // First bad commit once found
};

export type InteractiveRebaseAction = 'pick' | 'squash' | 'drop' | 'reword';

export type InteractiveRebaseStep = {
    action: InteractiveRebaseAction;
    commitId: string;
    message: string;
    newMessage?: string; // For reword action
};

export type PendingInteractiveRebase = {
    active: boolean;
    ontoCommitId: string;  // Commit ID to rebase onto
    ontoName: string;      // Human-readable name (branch name)
    steps: InteractiveRebaseStep[];
};

export type RepoState = {
    initialized: boolean;
    stagingCount: number;

    commits: Commit[];
    branches: Record<string, Branch>;
    stash: StashEntry[];

    head: { type: "branch"; name: string } | { type: "detached"; commit: string } | null;

    activeBranch: string | null;
    explanation: string;

    workingDirectory: FileContent[];
    stagingArea: FileContent[];
    conflicts: ConflictMarkers[];

    // === Advanced state ===
    tags: Tag[];
    reflog: ReflogEntry[];
    bisect: BisectState;
    pendingInteractiveRebase: PendingInteractiveRebase | null;
};
