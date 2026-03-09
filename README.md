# Crud (nodecrud)

Simple CRUD project with a React + Vite frontend and a Node backend.

## Repo layout
- d:\project\Crud\nodecrud\client — React (Vite)
- d:\project\Crud\nodecrud\server — Node / Express API

## Prerequisites
- Node.js 18+ (Windows)
- npm
- (optional) Git, GitHub CLI (`gh`)

## Setup (one-time)
Open PowerShell and run:
```bash
cd /d d:\project\Crud\nodecrud\client
npm install

cd /d d:\project\Crud\nodecrud\server
npm install
```

## Run (development)
Frontend:
```bash
cd /d d:\project\Crud\nodecrud\client
npm run dev
# default Vite port usually 5173
```

Backend:
```bash
cd /d d:\project\Crud\nodecrud\server
npm start
# or: node server.js (use the script defined in server/package.json)
# default API port (adjust if different) e.g. http://localhost:5000
```

Run both: open two terminals and run frontend and backend commands above.

## Common dev tips
- If UI hangs or is slow on "create account"/"create task":
  - Open DevTools → Network → inspect the request/response and timing.
  - Check backend terminal logs for long-running operations (email, sync bcrypt, DB).
  - Add timing middleware in server to log durations.

- If tasks are created on the server but not shown in UI:
  - Ensure the `createTask` thunk returns the created task object (normalize `res.data?.data ?? res.data`).
  - Ensure reducer pushes the returned task into `byBoard[boardId]` (handle board as id or object).
  - Files to check:
    - client/src/features/tasks/tasksSlice.js
    - client/src/pages/projects/BoardPage.jsx (where UI reads tasks)

## Push to GitHub (quick)
1. Configure git if not done:
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```
2A. If repo exists on GitHub:
```bash
cd /d d:\project\Crud
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```
2B. Create & push using GitHub CLI:
```bash
cd /d d:\project\Crud
gh auth login
gh repo create <repo-name> --public --source=. --remote=origin --push
```

## Troubleshooting Git push errors
- Authentication failed: use `gh auth login` or a Personal Access Token (HTTPS) / add SSH key (SSH).
- Permission denied (publickey): add your SSH public key to GitHub.
- Non-fast-forward: run `git pull --rebase origin main` then `git push`.

## Need more help?
- Paste the exact terminal error you get when pushing.
- Paste the create-task API response (Network tab) if tasks still don't bind.
