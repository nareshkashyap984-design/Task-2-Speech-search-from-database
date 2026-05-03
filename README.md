# Task 2: Speech Search from Database

## Live Deployed Portal Link

Vercel live link:

```text
https://task-2-speech-search-from-database.vercel.app
```

## Code Folder/Repository Link

Local code folder:

```text
E:\naresh project\New folder\Task-2-Speech-search-from-database
```

GitHub repository link:

```text
https://github.com/nareshkashyap984-design/Task-2-Speech-search-from-database
```

## Description

This portal provides text and speech-based search over complaint database records. It allows an evaluator or officer to:

- Ask natural-language questions about complaint records
- Use microphone input where browser speech recognition is supported
- Hear the answer automatically after asking a question
- Click any matching result row or its `Speak` button to hear that record
- Upload official CSV data for testing
- View a direct answer based on matching records
- See matching complaint records in a table
- View status and category chart output for the result set

The portal is ready for Neon PostgreSQL through a Vercel API endpoint:

```text
Frontend -> /api/complaints -> Neon PostgreSQL
```

If Neon is not configured, the API returns sample complaint records so the deployed portal still works for evaluation.

## Example Questions

- `How many pending complaints are there?`
- `Show high priority complaints`
- `Complaints from PS Quilla`
- `Show resolved fraud complaints`
- `Show complaints from PS Samalkha`

## Technologies Used

- HTML
- CSS
- JavaScript
- Browser SpeechRecognition API
- Browser FileReader API
- Vercel Serverless Function
- Neon PostgreSQL
- `@neondatabase/serverless`

## Folder Structure

```text
Task-2-Speech-search-from-database/
  api/
    complaints.js
  data/
    sample_complaints.csv
  database/
    schema.sql
    seed.sql
  app.js
  index.html
  styles.css
  package.json
  vercel.json
  .env.example
```

## Neon Setup

1. Create a Neon project at:

```text
https://console.neon.tech
```

2. Open the Neon SQL Editor.

3. Run:

```text
database/schema.sql
```

4. Then run:

```text
database/seed.sql
```

5. Copy the Neon database connection string.

6. In Vercel, add an environment variable:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require
```

## Vercel Deployment

1. Push this folder to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Add `DATABASE_URL` if Neon has been configured.
5. Deploy.

## Local Run

Install dependencies:

```bash
npm install
```

Create a `.env` file using `.env.example`:

```text
DATABASE_URL=your_neon_connection_string
```

Run locally with Vercel:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## CSV Fallback

You can use the `Upload CSV` button in the portal to test official CSV data manually.
