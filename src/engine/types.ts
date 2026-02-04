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
};
