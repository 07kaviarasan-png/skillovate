# Skillovate

Skillovate is a Campus Placement & Assessment Management Platform. It consists of a FastAPI backend and a Next.js frontend.

## Prerequisites

- Node.js (v18 or higher recommended)
- Python 3.12
- npm

## Running the Backend

The backend is built with FastAPI and uses a SQLite/MongoDB database depending on configuration.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python3.12 -m venv .venv
   source .venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Edit the `.env` file if necessary, e.g., configuring database URLs, JWT secrets)*

5. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`. You can access the API documentation at `http://localhost:8000/docs`.

## Running the Frontend

The frontend is a Next.js application.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`.

## Architecture Details
- **Backend:** FastAPI, Uvicorn, SQLAlchemy/Alembic, PyMongo.
- **Frontend:** Next.js (React), Tailwind CSS, React Hook Form, Zod.
