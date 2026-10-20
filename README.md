# Fund Tracker: Frontend

React web app for the Fund Management & Monthly Payment Tracker. Members submit their monthly payments and the admin reviews them, all from a clean, responsive dashboard.

It needs the Fund Tracker backend running to work.

## Tech stack

- React 19 and Vite
- React Router
- Axios
- Tailwind CSS 4
- lucide-react icons

## Features

**Admin**
- Dashboard with total approved fund, pending, approved and rejected counts, and paid and unpaid members for any month
- Members: add accounts, search, delete with a confirmation
- Payment Approvals: approve or reject pending payments, with a pending count in the sidebar
- All Payments: full history with filters for member, month, year and status
- Monthly Reports: paid, pending and unpaid members for a chosen month
- Fund Settings: change the monthly contribution
- Change Password and Logout

**Member**
- Dashboard with monthly contribution, personal total, group fund and months paid
- Submit Payment: month, year and method, with the amount filled in automatically
- My Payment History and My Monthly Status
- Change Password and Logout

**General**
- Login by email or username, with route protection by role
- Loading, empty, error and success states, toast messages and confirmation dialogs
- Works on desktop, tablet and mobile

## Requirements

- Node.js 20.19 or newer
- The backend running on http://127.0.0.1:8000

## Run locally

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

In development, Vite forwards every `/api` request to `http://127.0.0.1:8000`, so no extra settings are needed. If your backend runs on another port, change the `target` in `vite.config.js`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Create the production build in `dist` |
| `npm run preview` | Preview the production build locally |

## Environment variable

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `/api` | Full backend API URL for production, for example `https://my-api.example.com/api` |

Copy `.env.example` to `.env` to set it. This value is built into the app when you run `npm run build`, so rebuild after changing it.

## Deploy

1. Deploy the backend first and note its URL.
2. Set `VITE_API_URL` to the backend URL ending in `/api`.
3. Run `npm run build` and upload the `dist` folder to a static host.
4. Add a rewrite rule that sends all paths to `index.html`. Without it, refreshing a page like `/admin/dashboard` shows a 404.
5. Set `FRONTEND_ORIGIN` in the backend to this site's exact URL, without a trailing slash, and restart the backend.

Use HTTPS for both sites. A secure page cannot call an `http` backend.

If the frontend and backend share one domain and `/api` is forwarded to the backend, leave `VITE_API_URL` unset.

## How login works

The token returned by the backend is saved in the browser's `localStorage` and sent with every request. A 401 response, such as an expired token, logs the user out automatically. Logout removes the token.

## Project structure

```text
frontend/
├── src/
│   ├── api/          # Axios client and error messages
│   ├── components/   # StatCard, StatusBadge, ConfirmDialog, tables states
│   ├── context/      # AuthContext, ToastContext
│   ├── hooks/        # useFetch
│   ├── layouts/      # AppLayout (sidebar and mobile menu)
│   ├── pages/        # Login, ChangePassword, admin/, member/
│   ├── routes/       # ProtectedRoute
│   ├── utils/        # money, date and month helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```
