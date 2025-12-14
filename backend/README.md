# Backend Service

## Setup

1.  Navigate to `backend` directory.
2.  Run `npm install`.
3.  Create a `.env` file based on the example variables below:

    ```
    DATABASE_URL=postgresql://user:password@localhost:5432/your_db
    PORT=3001
    ```

4.  Initialize the database (run the SQL from `src/schema.sql` manually or use a tool).

## Running

-   Development: `npm run dev`
-   Production: `npm run build && npm start`
