export type Commit = {
    id: string;
    parents: string[];
    message: string;
    x: number; // lane
    y: number; // depth
};

export type Branch = {
    name: string;
    head: string | null;
    lane: number;
};

export type RepoState = {
    initialized: boolean;
    stagingCount: number;

    commits: Commit[];
    branches: Record<string, Branch>;

    head: { type: "branch"; name: string } | { type: "detached"; commit: string } | null;

    activeBranch: string | null; // convenience
    explanation: string;
};
