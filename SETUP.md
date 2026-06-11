# Setup Instructions

## 1. Install Dependencies

Run this command in the project root:

```bash
npm install
```

## 2. Create the Database

Create a MariaDB database for the project.

Example:

```sql
CREATE DATABASE blog_project;
```

## 3. Import Tables and Sample Data

Import the provided database initialization file:

```bash
mysql -u your_username -p blog_project < init-db.sql
```

This creates the required tables and inserts sample users, articles, comments, likes, and avatar data.

## 4. Create the `.env` File

Create a `.env` file in the project root based on `.env.sample`.

Example:

```env
EXPRESS_PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret

DB_HOST=localhost
DB_PORT=3306
DB_NAME=blog_project
DB_USER=your_username
DB_PASS=your_password
```

The real `.env` file should not be committed to git.

## 5. Start the Website

Run:

```bash
node app.js
```

Then open:

```text
http://localhost:3000
```

## 6. Sample Accounts

The sample users inserted by `init-db.sql` all use this password:

```text
password
```

Example usernames:

```text
alice
bob
charlie
diana
eve
```

## 7. Notes

- Uploaded article images are saved in `public/uploads`.
- Preset avatar images are saved in `public/avatarImages`.
- Database connection values are loaded from `.env`.
- If port `3000` is already in use, change `EXPRESS_PORT` in `.env`.
