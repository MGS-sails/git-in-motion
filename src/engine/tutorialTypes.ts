export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  hints: string[];
  // Validation function checks if the step is completed
  validate: (state: any) => boolean;
  // Optional: what commands are expected
  expectedCommands?: string[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string; // e.g., "5 min"
  icon: string;
  steps: TutorialStep[];
  mode?: "basic" | "advanced"; // Which mode this tutorial belongs to
  // Initial state for this tutorial
  initialState?: () => any;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStepIndex: number;
  completed: boolean;
  hintsUsed: number;
}
