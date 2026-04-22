# Git in Motion — Slide Companion
## Advanced Git for DPhil Students in Life Sciences

> **How to use this document**: Each module below maps directly to a tutorial in the *Git in Motion* app. Open the app alongside your slides, switch to **Advanced** mode, and use the corresponding tutorial to let students practice each concept live. Commands shown in `monospace` can be typed directly into the app terminal.

---

## Pre-Workshop Setup

**Instructor checklist:**
- [ ] Open Git in Motion in Advanced mode on the projector
- [ ] Students open the app on their own laptops (or share screen)
- [ ] Confirm everyone can reach Advanced mode via the toggle in the header
- [ ] Briefly demo: type `git init`, `git add .`, `git commit -m "start"` to show the graph

---

## Module 1 — Why Advanced Git? The Research Case
**Slides 1–6 | ~10 min**

### Slide 1 — Title
**"Your Analysis Has a History. Make It Legible."**
- Sub-title: Advanced Git for Reproducible Research
- Image suggestion: Side-by-side of a messy filesystem (`analysis_v2_FINAL_revised.R`) vs a clean git log

---

### Slide 2 — The Reproducibility Problem
**Pain point every researcher knows:**
- "Which script produced Figure 3 in the submitted version?"
- "My pipeline broke last week — when did that happen?"
- "My colleague edited the preprocessing — how do I see what changed?"

**Key message:** Git is not just for software engineers. It is a lab notebook for code and configuration.

**Speaker note:** Ask the room: "Has anyone lost analysis because of file versioning chaos?" — almost universal.

---

### Slide 3 — What You Already Know (Recap)
**Basic git is:**
- `git init` → create repository
- `git add` + `git commit` → snapshot working state
- `git branch` / `git switch` → parallel lines of work
- `git merge` / `git rebase` → combine work

**What we will add today:**
| Concept | Command | Research use case |
|---|---|---|
| Tags | `git tag` | Mark paper submission points |
| Interactive rebase | `git rebase -i` | Clean up history before sharing |
| Reflog | `git reflog` | Recover from accidental mistakes |
| Bisect | `git bisect` | Find when a result changed |
| Merge strategies | `--no-ff`, `--squash` | Structured collaboration |

---

### Slide 4 — The Git Mental Model (Visual)
**Three zones:**
```
Working Directory  →  Staging Area  →  Repository (Commits)
    (your files)        (git add)        (git commit)
```
**Add to mental model today:**
- Tags → persistent labels on commits (like bookmarks in a journal)
- Reflog → git's own diary of every HEAD movement
- Bisect → binary search through commit history

**Demo in app:** Point to the graph — each node is a commit, branches are labels, HEAD is "you are here".

---

### Slide 5 — Research Workflow Overview
**A typical DPhil workflow:**
```
main (stable analysis)
  ├── experiment/condition-A   (trying a preprocessing change)
  ├── experiment/condition-B   (alternative parameter set)
  └── manuscript/submission-1  (frozen for reviewers)
```
**Key habits we will build:**
1. Commit often with meaningful messages
2. Branch for experiments, merge back what works
3. Tag submission points
4. Clean up history before sharing with collaborators

---

### Slide 6 — The Cost of Ignoring Git History
**Real scenarios (anonymised from research groups):**
- Postdoc spent 3 days recreating analysis that was accidentally overwritten
- Paper reviewer asked for reproducibility package — couldn't identify which version produced figures
- Supervisor couldn't understand collaborator's changes (no commit messages)

**Git's promise:** Every committed state is recoverable. Every change is attributed. Every decision is traceable.

---

## Module 2 — Tags: Bookmarks for Your Research
**Slides 7–14 | ~15 min | App tutorial: "Versioning Research Milestones"**

### Slide 7 — What Is a Tag?
**A tag is a permanent label on a specific commit.**
- Unlike a branch (which moves when you commit), a tag stays fixed
- Analogy: A branch is a sticky note you move forward; a tag is a stamp you never move

**Types:**
| Type | Command | Use |
|---|---|---|
| Lightweight | `git tag v1.0` | Quick local label |
| Annotated | `git tag -a v1.0 -m "Paper submitted to Nature"` | Preferred — stores author, date, message |

**App demo:** Create 3 commits, then run `git tag -a submission-1 -m "Initial Nature submission"`. Watch the amber tag label appear on the commit.

---

### Slide 8 — Why Annotated Tags?
**Annotated tags are git objects** — they store:
- Tagger name and email
- Tagging date
- A message (your annotation)

**Recommended naming conventions for research:**
```
submission-nature-v1      # journal-version
thesis-chapter-3-final    # thesis milestone  
analysis-stable-2024-03   # date-stamped stable point
dataset-v2-preprocessed   # data version
```

**Avoid:** `final`, `final2`, `actually_final` — be specific and dateable.

---

### Slide 9 — Listing and Navigating Tags
```bash
git tag                          # list all tags
git tag -a milestone-1 -m "msg" # create annotated tag
git tag -d milestone-1           # delete tag
git checkout milestone-1         # inspect tagged state (detached HEAD)
```

**Research workflow example:**
```bash
# After writing a method section
git tag -a methods-draft-1 -m "Methods as submitted to supervisor, 2024-03-15"

# Before a major refactor
git tag -a pre-refactor -m "Stable analysis before rewriting normalisation"

# At paper submission
git tag -a nature-submission-1 -m "Final analysis package, Nature submission round 1"
```

**App demo:** Show how `git checkout nature-submission-1` puts you in detached HEAD — you can examine the state but not commit. Great for reproducibility audits.

---

### Slide 10 — Tags vs Branches in Research
**A common confusion:**

| | Branch | Tag |
|---|---|---|
| Moves when you commit? | Yes | No |
| Use for ongoing work? | Yes | No |
| Use for milestones? | No | Yes |
| Shared with collaborators? | Yes | Yes (with `git push --tags`) |

**Decision rule:** If you might add commits there, use a branch. If it marks a fixed point in history, use a tag.

---

### Slide 11 — Semantic Versioning for Research Scripts
**Borrow from software engineering:**
```
v{major}.{minor}.{patch}
v1.0.0  → First complete, working analysis
v1.1.0  → Added new normalisation method (backwards compatible)
v1.1.1  → Fixed a bug in Figure 3 generation
v2.0.0  → Complete rewrite after reviewer feedback
```

**For data:**
```
data-v1.0  → Raw data, first batch
data-v1.1  → Added samples 50-100
data-v2.0  → Re-preprocessed all samples with new pipeline
```

---

### Slide 12 — Hands-On: Tag Your Milestones
**Exercise (in app, Advanced mode, "Versioning Research Milestones" tutorial):**
1. Create a repository with 3 commits representing: initial analysis, first results, revised results
2. Tag the first results commit as `first-results`
3. Tag the revised commit as `v1.0`
4. List tags with `git tag`
5. Observe tags in the graph (amber labels)

**Discussion:** What are the key milestones in your current project that deserve a tag?

---

### Slide 13 — Tags for Thesis Chapters
**Practical tagging strategy for a DPhil thesis:**
```
Year 1:
  git tag -a chapter2-draft1 -m "Chapter 2, supervisor review round 1"
  git tag -a chapter2-draft2 -m "Chapter 2, revised after feedback"
  git tag -a chapter2-final  -m "Chapter 2, approved for thesis"

Year 2–3:
  git tag -a data-collection-complete -m "All samples collected and QC'd"
  git tag -a analysis-chapter3-v1     -m "Main analysis complete"

Viva:
  git tag -a viva-submission           -m "Submitted for examination, 2026-01"
  git tag -a thesis-corrections-final  -m "Corrections approved by examiners"
```

---

### Slide 14 — Transition to Next Module
**The problem we will solve next:**

> "My commit history looks like:
> - 'WIP'
> - 'fix'
> - 'fix again'
> - 'why doesn't this work'
> - 'ok it works now'
> - 'added analysis method'"
>
> *— every researcher ever*

**How do you share this with your supervisor?**

→ **Interactive Rebase**

---

## Module 3 — Interactive Rebase: Writing Clean History
**Slides 15–24 | ~20 min | App tutorial: "Cleaning History Before Sharing"**

### Slide 15 — The Problem with Honest History
**Your history while working:**
```
a1b2c  WIP working on normalisation
d3e4f  fix typo in variable name
g5h6i  actually fix the bug
j7k8l  remove debug print statements  
m9n0p  cleaning up
q1r2s  add normalisation method (polished)
```

**What your supervisor/collaborator should see:**
```
q1r2s  Add robust normalisation method with cross-validation
```

**Key insight:** Commit history is communication. Clean it before sharing.

---

### Slide 16 — What Interactive Rebase Does
**`git rebase -i HEAD~N`** opens an editor showing the last N commits:
```
pick a1b2c WIP working on normalisation
pick d3e4f fix typo in variable name
pick g5h6i actually fix the bug
pick j7k8l remove debug print statements
pick m9n0p cleaning up
pick q1r2s add normalisation method (polished)
```

**You can:**
- `pick` — keep commit as-is
- `squash` — combine with previous commit
- `drop` — delete commit entirely
- `reword` — keep commit, change message

---

### Slide 17 — The Four Operations
**Visual reference:**
| Operation | Effect | When to use |
|---|---|---|
| `pick` | Keep commit unchanged | Good, meaningful commits |
| `squash` | Meld into previous commit | "WIP", "fix", "fix again" |
| `drop` | Delete the commit entirely | Dead ends, debug code |
| `reword` | Change the message only | Good change, bad message |

**Important:** Squash combines changes AND merge the commit messages (you edit the combined message).

---

### Slide 18 — Interactive Rebase in the App
**App demo steps (use "Cleaning History Before Sharing" tutorial):**
1. Create 4 commits: "init analysis", "WIP", "fix", "final method"
2. Type `git rebase -i HEAD~3` — the interactive rebase panel opens
3. Set: pick first, squash "WIP", squash "fix", reword last
4. Execute — watch the graph show new, cleaner commits
5. Note: old commits are now orphaned (greyed out)

**Discussion question:** Which three commits in your current project would you squash if you could?

---

### Slide 19 — The Golden Rule of Rebase
**⚠️ NEVER rebase commits that have been pushed/shared**

**Why?** Rebase creates NEW commit objects (new hashes). If someone else has the old commits, their history will diverge.

**Safe rebase:** Only rebase commits that exist only on your local machine, before pushing.

**Research context:**
- ✅ Squash your "WIP" commits before sharing your analysis branch with a collaborator
- ✅ Clean up before submitting a pull request  
- ❌ Never rebase `main` or shared branches others are building on

---

### Slide 20 — When Rebase Goes Wrong: Conflicts
**If commits conflict during interactive rebase:**
```
error: could not apply d3e4f... fix typo
After resolving conflicts, run: git rebase --continue
Or to skip: git rebase --skip
Or to abort: git rebase --abort
```

**Resolution steps:**
1. Open conflicted files, resolve manually
2. `git add <resolved-file>`
3. `git rebase --continue`

**Or** cancel the whole thing: `git rebase --abort`

---

### Slide 21 — Rebase vs Merge: Research Contexts
**When to use each:**
| Scenario | Use |
|---|---|
| Integrating finished feature into main | Either |
| Cleaning up before sharing with supervisor | Rebase |
| Combining experiment branches | Merge (preserves divergence) |
| Making history readable for paper supplement | Rebase |
| Working on a team's shared branch | Merge (safer) |

**DPhil rule of thumb:** Rebase privately, merge publicly.

---

### Slide 22 — Commit Message Standards for Research
**A good research commit message:**
```
Add cross-validation to normalisation pipeline

- Uses 5-fold CV to select optimal lambda parameter
- Addresses reviewer comment #3 from Nature submission
- Benchmark: reduces MSE by 12% on held-out test set
- See analysis/normalisation/cv_benchmark.R for details
```

**Structure:**
- First line: imperative mood, <72 chars, answers "what does this commit do?"
- Blank line
- Body: why the change, what it achieves, references

---

### Slide 23 — Hands-On: Clean Your History
**Exercise (in app, Advanced mode):**
1. Create 5 commits: "initial code", "WIP", "debug", "more fixes", "working analysis"
2. Run `git rebase -i HEAD~4`
3. Drop "debug", squash "WIP" and "more fixes" into the first, reword "working analysis"
4. Execute and compare the before/after graphs

**Debrief:** What does the graph look like now? How many commits are left?

---

### Slide 24 — Transition to Recovery
**The fear that stops people from using advanced git:**

> "What if I mess something up and lose my work?"

**Answer:** git almost never permanently deletes anything.

→ **The Reflog**

---

## Module 4 — Reflog: Git's Black Box Flight Recorder
**Slides 25–31 | ~15 min | App tutorial: "Recovering Lost Analysis"**

### Slide 25 — What Is the Reflog?
**The reflog records every movement of HEAD:**
```
HEAD@{0}: commit: Add cross-validation method
HEAD@{1}: reset: moving to HEAD~2
HEAD@{2}: commit: Clean up variable names
HEAD@{3}: commit: WIP normalisation
HEAD@{4}: checkout: moving from experiment/A to main
```

**Key property:** The reflog is LOCAL — it records what YOU did on YOUR machine.

**Research analogy:** Like a lab notebook for git operations — not just what changed, but what actions you took.

---

### Slide 26 — When You Need the Reflog
**Classic recovery scenarios:**
1. `git reset --hard HEAD~5` — "I went back too far!"
2. `git branch -d my-branch` — "I deleted the wrong branch!"
3. After interactive rebase — "My old commits disappeared!"
4. `git checkout <old-commit>` then lost track — "Where was I?"

**The reflog saves you every time.**

---

### Slide 27 — Using the Reflog to Recover
**Step 1: Find what you lost**
```bash
git reflog
# HEAD@{0}: reset: moving to HEAD~3  ← where you are now
# HEAD@{1}: commit: Analysis v2      ← what you want
# HEAD@{2}: commit: Analysis v1
```

**Step 2: Recover the commit**
```bash
# Option A: Reset to that point
git reset --hard HEAD@{1}

# Option B: Create a new branch from the lost commit
git branch recovered-work HEAD@{1}
```

**App demo:** App tracks all HEAD movements in the Reflog Panel. Click any entry to recover.

---

### Slide 28 — Reflog in the App
**Reflog Panel (Advanced mode only):**
- Shows every HEAD movement with action label
- Lists commit ID, branch, and what happened
- Click "Restore" on any entry to recover the state
- Reference commits as `HEAD@{N}` in commands

**Demo (in app, "Recovering Lost Analysis" tutorial):**
1. Create 3 commits
2. Accidentally `git reset --hard HEAD~2`
3. Open Reflog panel — see the lost commits listed
4. Use the commit hash from reflog to restore work

---

### Slide 29 — Reflog Expiry
**Reflog entries are kept for:**
- Normal entries: 90 days (default)
- Unreachable commits: 30 days (default)

**Practical implication:** You have a 30–90 day window to recover "lost" work.

**After that:** `git gc` (garbage collection) prunes unreachable objects.

**Configure longer retention if needed:**
```bash
git config gc.reflogExpire 365
git config gc.reflogExpireUnreachable 90
```

---

### Slide 30 — Common Recovery Scenarios: Quick Reference
| Scenario | Recovery |
|---|---|
| Accidental `git reset --hard` | `git reflog` → `git reset --hard HEAD@{N}` |
| Deleted branch | `git reflog` → `git branch new-name HEAD@{N}` |
| Lost commits after rebase | `git reflog` → find pre-rebase hash → `git reset --hard <hash>` |
| Stash lost after `stash clear` | Unfortunately not in reflog — stash refs expire faster |

---

### Slide 31 — Hands-On: Rescue a Reset
**Exercise (in app):**
1. Set up: `git init`, 3 commits
2. "Accidentally" run: `git reset --hard HEAD~2`
3. Run `git reflog` — find the lost commit hash
4. Run `git reset --hard <lost-hash>` — recover it
5. Verify the graph is restored

**Discussion:** Does this change how you feel about using `git reset --hard`?

---

## Module 5 — Git Bisect: Finding the Broken Commit
**Slides 32–39 | ~15 min | App tutorial: "Finding a Regression"**

### Slide 32 — The Reproducibility Crisis in Your Pipeline
**Scenario familiar to computational researchers:**
- "This figure looked different 2 months ago"
- "Something changed in my preprocessing, but I don't know when"
- "The clustering changed after I 'improved' the normalisation — but which commit?"

**Manual approach:** Check out old commits one by one... 😩

**Git's approach:** Binary search through history.

---

### Slide 33 — What Is Git Bisect?
**Binary search through commit history to find a regression:**
```
Commits: A - B - C - D - E - F - G (current, broken)
                      ↑
              git bisect found this is when it broke
```

**How it works:**
1. You tell git: "HEAD is broken (bad)"
2. You tell git: "Commit A was good"
3. Git checks out the midpoint (D)
4. You test: broken or not?
5. Git narrows the search space by half
6. Repeat until the first bad commit is found

**Efficiency:** For 1000 commits, only ~10 tests needed.

---

### Slide 34 — Git Bisect Commands
```bash
git bisect start            # begin bisect session
git bisect bad              # mark current commit as bad (broken)
git bisect good <commit>    # mark a known-good commit
# Git checks out middle commit
# You test your analysis
git bisect bad              # if it fails here too
git bisect good             # if it works here
# Repeat until git reports the first bad commit
git bisect reset            # end session, return to HEAD
```

---

### Slide 35 — Bisect in Practice: Research Example
**Scenario:** Figure 4 looks wrong. It was fine in your `v1.2` tag.

```bash
git bisect start
git bisect bad HEAD                 # current version is broken
git bisect good v1.2                # v1.2 tag was fine

# Git checks out commit between v1.2 and HEAD
# Run your analysis: Rscript figures/figure4.R
# If figure looks wrong:
git bisect bad
# If figure looks right:
git bisect good
# Repeat ~5-6 times
# Git reports: "abc123 is the first bad commit"
git show abc123                     # See exactly what changed
git bisect reset                    # Back to HEAD
```

---

### Slide 36 — Automated Bisect
**For large histories, automate the test:**
```bash
git bisect start
git bisect bad HEAD
git bisect good v1.2
git bisect run Rscript test_figure4.R
# Git automatically runs the script at each midpoint
# Script should exit 0 for "good", non-zero for "bad"
```

**Writing a bisect test script for analysis:**
```R
# test_figure4.R
result <- run_analysis()
expected_range <- c(0.4, 0.6)  # expected AUC range
if (result$auc < expected_range[1] || result$auc > expected_range[2]) {
  quit(status = 1)  # bad
}
quit(status = 0)    # good
```

---

### Slide 37 — Bisect in the App
**Demo (in app, "Finding a Regression" tutorial):**
1. Create 6 commits (simulating a pipeline with a bug introduced at commit 4)
2. `git bisect start`
3. `git bisect bad` (HEAD is broken)
4. `git bisect good <first-commit>` (first commit was fine)
5. Watch app highlight current commit to test
6. Mark good/bad until the culprit is found
7. `git bisect reset`

**The graph shows:** good commits (green), bad commits (red), and bisect progress.

---

### Slide 38 — When to Use Bisect
**Use bisect when:**
- A test that previously passed now fails
- A figure or result changed unexpectedly
- You have more than ~10 commits to check
- You can write an objective pass/fail test

**Not ideal when:**
- Changes are highly interdependent (many files changed together)
- No automated test exists (though manual testing still works)
- You don't have a known-good historical point

---

### Slide 39 — Transition to Collaboration
**So far:** Individual workflows (tag, clean up, recover, diagnose)

**Next:** Working with others — supervisors, collaborators, labmates

→ **Merge Strategies and Branch Workflows**

---

## Module 6 — Collaborative Research Workflows
**Slides 40–48 | ~20 min | App tutorial: "Feature Branch Workflow"**

### Slide 40 — The Challenge of Multi-Person Research Code
**Common pain points:**
- Supervisor edits your analysis overnight — now your version conflicts
- Two PhD students work on the same preprocessing pipeline
- How do you isolate "trying a new approach" from "stable working analysis"?

**Solution:** Structured branching with clear merge strategies.

---

### Slide 41 — Branch Naming for Research
**Recommended conventions:**
```
main              # always stable, supervisor-approved analysis
dev               # integration branch for ongoing work

experiment/condition-A     # specific experimental condition
experiment/new-normalisation  # testing a new approach
analysis/chapter3-draft    # thesis chapter work

fix/figure4-outliers       # specific bug fixes
review/nature-revision-1   # responding to reviewer comments
```

**Rule:** Branch names should answer "what is this branch for?" without explanation.

---

### Slide 42 — Merge --no-ff: Preserving Branch History
**Default (fast-forward) merge:**
```
Before:                After fast-forward merge:
main: A-B              main: A-B-C-D
experiment:   C-D      (no record that C-D were on experiment!)
```

**`git merge --no-ff` (no fast-forward):**
```
Before:                After --no-ff merge:
main: A-B              main: A-B-M
experiment:   C-D             ↙ ↘
                           C   D
(M is a merge commit, preserving branch history)
```

**Research value:** You can see exactly which commits were part of each experiment.

---

### Slide 43 — Merge --squash: Clean Integration
**For clean integration of messy experiment branches:**
```bash
git switch main
git merge --squash experiment/new-normalisation
# All experiment commits are squashed into staging area
git commit -m "Add cross-validation normalisation (from experiment/new-normalisation)"
```

**Result:** One clean commit on main, full history preserved on the experiment branch.

**When to use:** When your experiment branch has lots of "WIP" commits but the end result is clean.

---

### Slide 44 — Merge Strategies: Decision Tree
```
Is the branch being merged a finished feature?
  └── Yes: Ready to integrate into main
        └── Is the branch history meaningful?
              ├── Yes (shows experimental process) → git merge --no-ff
              └── No (lots of WIP/fix commits) → git merge --squash
  └── No: Still in progress
        └── Keep on feature branch, rebase periodically to stay current
```

**Practical for research:**
- Experiment branches → usually `--no-ff` (preserve the experimental context)
- Fix branches → usually `--squash` (just the fix matters, not the debugging)

---

### Slide 45 — A Research Collaboration Model
**Supervisor-student model:**
```
main      ← supervisor reviews and approves
  │
  ├── analysis/method-A     ← student's current work
  ├── analysis/method-B     ← alternative approach
  └── review/response-r1    ← reviewer response work
```

**Workflow:**
1. Student creates branch, does analysis
2. Cleans up history with `git rebase -i`
3. Tags key milestones
4. Supervisor reviews the branch
5. Merge with `--no-ff` so branch origin is visible
6. Tag the merge commit with paper/thesis milestone

---

### Slide 46 — Hands-On: Full Workflow
**Exercise (in app, Advanced mode, "Feature Branch Workflow" tutorial):**
1. Set up main with 2 commits
2. Create `experiment/condition-A` branch
3. Make 3 commits on the branch (including some "WIP" commits)
4. Clean up with `git rebase -i HEAD~3` (squash WIPs)
5. Tag the cleaned-up result: `git tag -a exp-A-result -m "Condition A analysis complete"`
6. Switch to main, `git merge --no-ff experiment/condition-A`
7. Observe the graph: the branch structure is preserved in the merge commit

---

### Slide 47 — Version Control for Data and Notebooks
**What to put in git:**
- ✅ Analysis scripts (.R, .py, .sh)
- ✅ Configuration files (parameters, settings)
- ✅ Small reference data (<1MB, e.g., gene lists, lookup tables)
- ✅ Notebooks (.ipynb) — with caveats about output cells
- ✅ Documentation and README files

**What NOT to put in git:**
- ❌ Raw sequencing data (use a data repository: GEO, ENA, OSF)
- ❌ Large processed data (>10MB) — use Git LFS or separate storage
- ❌ Binary files that change frequently (compiled models, etc.)
- ❌ Sensitive patient data (regulatory compliance)

**Use `.gitignore`** to exclude large files:
```
*.fastq
*.bam
*.vcf.gz
data/raw/
results/large/
```

---

### Slide 48 — Git LFS for Large Files (Overview)
**Git Large File Storage (LFS):**
- Replaces large files with text pointers in git
- Actual data stored on a separate server
- Transparent to your workflow

```bash
git lfs install
git lfs track "*.rda"      # R data objects
git lfs track "*.h5ad"     # AnnData objects (single-cell)
git lfs track "results/**/*.csv"
```

**Alternatives for research data:**
- **OSF (Open Science Framework)** — good for collaboration
- **Zenodo** — permanent DOI for data
- **DVC (Data Version Control)** — git-like versioning for data pipelines

---

## Module 7 — Best Practices and Wrap-Up
**Slides 49–55 | ~10 min**

### Slide 49 — The Minimum Viable Git Practice for Researchers
**10 habits that make a difference:**
1. Commit after every meaningful change (not every day, after every *change*)
2. Write commit messages as if explaining to your future self
3. Use branches for experiments; keep main stable
4. Tag every submission, milestone, and stable analysis point
5. Clean up history with `git rebase -i` before sharing
6. Never panic — check `git reflog` first
7. Use `git bisect` when something breaks unexpectedly
8. Use `--no-ff` when merging experiment branches
9. Write a `README.md` at the start of every project
10. Put `.gitignore` in place before your first commit

---

### Slide 50 — Commit Message Template for Research
**Suggest adding to your git config:**
```bash
git config --global commit.template ~/.gitmessage
```

**`~/.gitmessage` contents:**
```
# Title: imperative, ≤72 chars (e.g., "Add cross-validation to normalisation")

# Why: What is the context/motivation?

# What: What did you change? Key decisions?

# References: Paper/issue/analysis file?
```

---

### Slide 51 — Integration with Research Tools
**Git + common research platforms:**
| Platform | Integration |
|---|---|
| GitHub/GitLab | Remote backup, collaboration, PR reviews |
| OSF | Link git repos to projects (DOI) |
| Zenodo | Archive git releases with automatic DOI |
| ORCID | Link your repos to your researcher profile |
| DVC | Git-compatible data version control |

**Supervisor code review via pull requests:** Share a branch, supervisor comments on specific lines — much better than "please see my comments in analysis_v4_revised.R".

---

### Slide 52 — Before You Leave: Your Git Audit Checklist
**For your current project, can you answer:**
- [ ] When did I last commit my analysis scripts?
- [ ] Does my commit history tell the story of the analysis?
- [ ] Is there a tag on my last stable analysis?
- [ ] If my laptop died today, could I recover everything from git?
- [ ] Does my supervisor know how to clone and run my analysis?

**If any answer is no — fix it this week.**

---

### Slide 53 — Advanced Topics (Self-Study)
**Beyond this workshop:**
| Topic | What it solves |
|---|---|
| `git worktree` | Two checkouts of the same repo simultaneously |
| `git submodule` | Shared analysis libraries across projects |
| Git hooks (pre-commit) | Automated checks before every commit |
| GitHub Actions | CI/CD for analysis pipelines |
| DVC pipelines | Reproducible data processing DAGs |
| Conventional Commits | Standardised commit message format |

**Recommended resources:**
- *Pro Git* book (free online at git-scm.com/book)
- *The Turing Way* — reproducible research practices
- Software Carpentry Git lessons

---

### Slide 54 — Summary: What We Covered
| Concept | Command | Use case |
|---|---|---|
| Tags | `git tag -a` | Paper submission milestones |
| Interactive rebase | `git rebase -i` | Cleaning up before sharing |
| Reflog | `git reflog` | Recovering from mistakes |
| Bisect | `git bisect` | Finding regressions in pipeline |
| Merge --no-ff | `git merge --no-ff` | Preserving branch history |
| Merge --squash | `git merge --squash` | Clean single-commit integration |

---

### Slide 55 — Q&A and Practice
**Open-ended questions to prompt discussion:**
- What is the messiest part of your current project's git history?
- Which of these commands would have saved you the most time in the last year?
- How would you structure branches for your next experiment?

**Remaining time:** Students work through any remaining app tutorials in Advanced mode.

**App tutorials available in Advanced mode:**
1. Versioning Research Milestones (tags)
2. Cleaning History Before Sharing (interactive rebase)
3. Recovering Lost Analysis (reflog)
4. Finding a Regression (bisect)
5. Feature Branch Workflow (--no-ff, --squash)

---

## Appendix A — Command Quick Reference

```bash
# TAGS
git tag                                    # list tags
git tag -a v1.0 -m "description"          # annotated tag at HEAD
git tag -a v1.0 <commit> -m "desc"        # annotated tag at specific commit
git tag -d v1.0                            # delete tag
git checkout v1.0                          # inspect tag (detached HEAD)

# INTERACTIVE REBASE
git rebase -i HEAD~3                       # rebase last 3 commits interactively
git rebase -i <commit>                     # rebase from a specific commit
git rebase --continue                      # after resolving conflicts
git rebase --abort                         # cancel the rebase

# REFLOG
git reflog                                 # show HEAD movement history
git reset --hard HEAD@{3}                  # recover to 3 states ago
git branch rescued HEAD@{2}               # create branch from reflog entry

# BISECT
git bisect start                           # begin bisect
git bisect bad                             # mark current as bad
git bisect good v1.0                       # mark known-good point
git bisect good / git bisect bad          # respond to each midpoint
git bisect reset                           # end session

# MERGE STRATEGIES
git merge --no-ff feature-branch           # force merge commit
git merge --squash feature-branch          # squash all into staging
git merge --abort                          # cancel merge in progress
```

---

## Appendix B — Recommended Workshop Schedule

| Time | Activity |
|---|---|
| 00:00–00:10 | Welcome, app setup, basic recap (Module 1 slides 1–6) |
| 00:10–00:25 | Tags lecture + hands-on (Module 2) |
| 00:25–00:50 | Interactive rebase lecture + hands-on (Module 3) |
| 00:50–01:05 | Reflog lecture + hands-on (Module 4) |
| 01:05–01:20 | Bisect lecture + hands-on (Module 5) |
| 01:20–01:40 | Collaborative workflows lecture + hands-on (Module 6) |
| 01:40–02:00 | Best practices (Module 7) + Q&A |

**Total:** ~2 hours. Can be split into two 1-hour sessions (Modules 1–4, then 5–7).

---

## Appendix C — Instructor Notes

**Common misconceptions to address proactively:**

1. **"Rebase is dangerous"** — It's only dangerous on shared branches. Local rebase is safe and powerful.

2. **"Tags are just bookmarks"** — Annotated tags are git objects with metadata; they're more like signed certificates.

3. **"Git bisect only works with code bugs"** — It works for any objective test: "does this figure match expectations?", "does this pipeline finish in <5 minutes?", etc.

4. **"Reflog is the same as log"** — `git log` shows commit history of the repo; `git reflog` shows your local actions (checkout, reset, merge, etc.).

5. **"I should commit raw data"** — Emphatically no for large data. The code that generates derived data should be committed; the raw data lives in a dedicated data repository.

**When students get confused by detached HEAD:**
> "HEAD usually points to a branch, which points to a commit. When you `git checkout <tag>`, HEAD points directly to the commit — that's detached HEAD. You can look around, but create a branch before committing."
