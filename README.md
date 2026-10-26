# Leela

**Leela** is a Jira-inspired project and issue-tracking application designed to support team collaboration, ticket management, and role-based workflows.

## Features

- **User authentication:** Registration and login with role-based access control.
- **User approval:** New registrations can be managed through an approval workflow.
- **Ticket management:** Create, view, update, and manage tickets.
- **Role-based assignments:** Ticket assignment follows role and department permissions.
- **Team collaboration:** Organize work around teams and departments.
- **Persistent storage:** PostgreSQL database managed using SQLAlchemy and Alembic.
- **Modern interface:** Responsive frontend built with Next.js, TypeScript, and Tailwind CSS.

## Tech Stack

### Frontend
- Next.js with App Router
- TypeScript
- Tailwind CSS
- React

### Backend
- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic

### Database and Infrastructure
- PostgreSQL
- Supabase (hosted PostgreSQL)
- Vercel (frontend deployment)
- Render (backend deployment)

## Project Structure

```text
leela/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── ...
│   ├── alembic/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
└── README.md
```

The exact directory structure may evolve as the application develops.

## Prerequisites

Install the following before running the application locally:

- Python 3.10 or a compatible version supported by the backend dependencies
- Node.js and npm
- Access to a PostgreSQL database
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nrynmish/leela.git
cd leela
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` and configure the required environment variables.

Example:

```dotenv
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_secure_secret_key
```

Use the actual environment variable names expected by the backend configuration. Additional variables may be required depending on your local configuration.

**Important:** Never commit `.env` files, database credentials, API keys, or production secrets.

### 3. Run Database Migrations

With the virtual environment activated and the database configuration set, run:

```bash
alembic upgrade head
```

This applies the available Alembic migrations to the configured database.

**Database warning:** Verify the target database before running migrations. If your local configuration points to the production Supabase database, migration commands will affect that database.

### 4. Start the Backend

From the `backend/` directory, run:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend should be available at:

- API base: `http://127.0.0.1:8000`
- Interactive API documentation: `http://127.0.0.1:8000/docs`
- Health endpoint, if enabled: `http://127.0.0.1:8000/health`

### 5. Configure the Frontend

Open a separate terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create `.env.local` in `frontend/`:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Ensure this URL matches the address at which your backend is running.

### 6. Start the Frontend

From `frontend/`, run:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Development Commands

### Frontend

Run the development server:

```bash
npm run dev
```

Build the production frontend:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run the configured lint command:

```bash
npm run lint
```

### Backend

Start the development server:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Apply database migrations:

```bash
alembic upgrade head
```

Generate a migration after making supported model changes:

```bash
alembic revision --autogenerate -m "describe your change"
```

Review generated migration files before applying them.

## Authentication and Permissions

Leela uses role-based access control to govern user actions and ticket assignment.

The application includes an approval workflow for newly registered users. Ticket assignment rules restrict which users can assign work and which users can be selected as assignees.

The backend is responsible for enforcing these permissions; frontend visibility alone should not be treated as an authorization boundary.

Refer to the current backend implementation for the authoritative permission rules.

## Environment Variables

Environment variables should be configured locally and supplied through the deployment platform in production.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET_KEY` | Secret used by the authentication configuration |
| `NEXT_PUBLIC_API_URL` | Backend API base URL used by the frontend |

The exact names and required values depend on the current application configuration. Consult the backend settings and frontend environment-variable usage before deploying.

Never expose database credentials or private secrets through variables prefixed with `NEXT_PUBLIC_`.

## Deployment

The current deployment setup uses:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Supabase PostgreSQL

Configure production environment variables in the corresponding hosting platforms. Ensure the frontend points to the deployed backend and that the backend uses the intended database.

Run migrations deliberately against the intended database before deploying schema changes.

## Contributing

1. Create a branch for your change.
2. Keep changes focused and review the diff before committing.
3. Test the affected frontend or backend functionality.
4. Avoid committing secrets, local environment files, or generated artifacts.
5. Use descriptive commit messages.

## License

No license has been specified in this repository. All rights and permissions remain subject to the repository owner's applicable terms unless a license is added.
