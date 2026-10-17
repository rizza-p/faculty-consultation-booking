# GitHub Collaboration Guide

The assignment requires visible, genuine contributions from Jay, Rizza, and Axl. A generated project archive does not create repository history by itself. Each member must perform and understand their own work.

## 1. Create the repository

1. Sign in to GitHub and select **New repository**.
2. Repository name: `faculty-consultation-booking`.
3. Choose **Private** or **Public** according to your instructor's requirements; make sure the instructor can access it.
4. Do not initialize with a README if you already have this project's README.
5. On your computer, extract the project ZIP and open a terminal in the project folder.

```bash
git init
git add .
git commit -m "chore: add initial project structure"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/faculty-consultation-booking.git
git push -u origin main
```

Replace `YOUR-USERNAME` with the repository owner's actual GitHub username. Never upload `.env` or `node_modules`.

## 2. Agree on ownership

Use these as suggested responsibilities, not a substitute for actual collaboration:

- **Jay — Backend/routes:** booking request validation, booking workflow, and route tests.
- **Rizza — Frontend/views:** EJS pages, responsive CSS, and form usability.
- **Axl — Database/auth/testing:** schema, seed accounts, session/authentication review, and test plan.

All three members should review the whole system and help test it.

## 3. Create issues

Create real GitHub Issues such as:
- `Set up Express app and MySQL schema`
- `Implement login, logout, and role access`
- `Build student booking and history`
- `Build faculty availability and approval`
- `Build admin dashboard`
- `Validate booking conflicts and edge cases`
- `Test end-to-end workflows and update README`

Assign each issue to the member doing the work. Link pull requests to issues using `Closes #ISSUE_NUMBER`.

## 4. Work on feature branches

Each member should create a branch from an updated `main`, for example:

```bash
git checkout main
git pull origin main
git checkout -b feature/student-booking
```

After making and testing meaningful changes:

```bash
git add routes/bookings.js views/student-bookings.ejs
git commit -m "feat: implement student consultation requests"
git push -u origin feature/student-booking
```

Use commit prefixes such as `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, and `chore:`. Commit the files that were actually changed; do not use the example command unchanged if those files were not your changes.

## 5. Open a pull request and review

1. On GitHub, choose **Compare & pull request** for the pushed branch.
2. Describe what changed, which issue it addresses, and how you tested it.
3. Request review from another team member.
4. Reviewer checks functionality, validation, access control, code clarity, and regressions.
5. Reviewer leaves specific comments and approves only after inspecting the changes.
6. Merge after the review and resolve the issue.
7. Delete the feature branch if your team workflow allows it.

## 6. Suggested branch/PR distribution

| Member | Example branch | Example contribution |
|---|---|---|
| Jay | `feature/booking-routes` | Create/update/cancel/reschedule logic and conflict checks |
| Rizza | `feature/booking-ui` | Student/faculty views and responsive styles |
| Axl | `feature/auth-db-tests` | Schema/seed, authentication review, and test documentation |

Adapt this distribution to the actual work. Every member should have meaningful code changes, commits, issues, PR participation, and a review of another member's work.

## 7. Project board

Create a GitHub Project board with columns:
- Backlog
- Todo
- In Progress
- Review
- Done

Move issues based on their real status. Do not mark unfinished tasks as done.

## 8. Final checks

- [ ] Instructor can access the repository.
- [ ] Three members have meaningful, visible contributions.
- [ ] Work is shown through feature branches and PRs.
- [ ] PRs have genuine peer reviews.
- [ ] Issues and project board reflect actual work.
- [ ] Commit messages use conventional prefixes.
- [ ] `README.md`, requirements, tests, license, and AI disclosure are present.
- [ ] `.env` and `node_modules/` are not committed.
- [ ] Every member can explain their own code and demonstrate the system.
