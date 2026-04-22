🧠 Slide 1 — Title

Git Rebase: Clean History Without Losing Your Mind

What it is
Why it matters
When NOT to use it
⚠️ Slide 2 — The Problem
Why do we even need rebase?

Messy commit history
Feature branches drifting away from main
Hard-to-read PRs

👉 Example:

A---B---C (main)
\
D---E---F (feature)
🔄 Slide 3 — Merge vs Rebase (Core Idea)

Merge = preserves history
Rebase = rewrites history

👉 Merge:

A---B---C------M (main)
\        /
D---E---F

👉 Rebase:

A---B---C---D'---E'---F' (feature)

💡 Key point:

Rebase makes it look like your work started from the latest main

🧩 Slide 4 — What Rebase Actually Does

Rebase = replay your commits on top of another branch

Steps:

Find common ancestor
Temporarily remove your commits
Move branch pointer
Reapply commits one by one
⚙️ Slide 5 — Basic Command
git checkout feature
git rebase main

👉 Meaning:

“Take my feature commits and replay them on top of main”

🔥 Slide 6 — Live Demo Plan (IMPORTANT)

Tell your team:

“Watch what happens to commit history”

Steps:

git checkout -b feature
# make 2–3 commits

git checkout main
# make 1 commit

git checkout feature
git rebase main

Then show:

git log --oneline --graph
⚠️ Slide 7 — Conflicts During Rebase

Rebase stops when conflict happens.

CONFLICT (content): Merge conflict in file.py

Fix it, then:

git add .
git rebase --continue
🧯 Slide 8 — Escape Hatch

If things go sideways:

git rebase --abort

💡 Always mention this. It reduces fear.

🧠 Slide 9 — Golden Rule

Never rebase shared branches

❌ Bad:

rebasing main
rebasing a branch others are using

✅ Safe:

your own feature branch

👉 Why?
Because rebase rewrites commit history → breaks others

🧼 Slide 10 — Why Teams Love Rebase
Cleaner commit history
Linear timeline
Easier debugging (git bisect)
Cleaner PRs
🧠 Slide 11 — Interactive Rebase (Power Move)
git rebase -i main

You can:

squash commits
rename commits
reorder commits

👉 Example:

pick a1 Fix bug
squash b2 typo
🧪 Slide 12 — Before vs After (Impact)

Before:

Fix bug
Fix typo
Fix typo again
Final fix

After rebase:

Fix bug properly

💡 This is what senior engineers do before PR

⚖️ Slide 13 — When to Use Rebase vs Merge

Use Rebase when:

working on feature branch
preparing PR
cleaning commits

Use Merge when:

integrating shared work
preserving history matters
🧠 Slide 14 — Mental Model

👉 Rebase = "pretend I started from latest main"

👉 Merge = "combine histories as they happened"

💥 Slide 15 — Common Mistakes
Rebasing main
Rebasing after pushing (without force push awareness)
Panic during conflicts
🧪 Slide 16 — Exercise (Hands-On)

Give them this:

Create feature branch
Add 3 messy commits
Update main
Rebase feature onto main
Squash commits
🧠 Slide 17 — One-Line Summary

Rebase rewrites history to make it clean and linear — use it carefully, but use it often.

🚀 Delivery Tips (This matters more than slides)

Don’t just present — show it live:

git log --graph before/after
intentionally trigger a conflict
fix it in front of them

👉 That’s what makes it “click”