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

export type RepoState = {
    initialized: boolean;
    stagingCount: number;

    commits: Commit[];
    branches: Record<string, Branch>;
    stash: StashEntry[];  // Stash stack

    head: { type: "branch"; name: string } | { type: "detached"; commit: string } | null;

    activeBranch: string | null; // convenience
    explanation: string;

    workingDirectory: FileContent[];  // Current file state (editable)
    stagingArea: FileContent[];       // Staged files ready to commit
    conflicts: ConflictMarkers[];     // Active merge conflicts
};
