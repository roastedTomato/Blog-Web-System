# Blog Web System

A full-stack blogging application built with Node.js, Express, Handlebars and MariaDB. It combines server-rendered pages with Fetch-based interactions for article sorting, comments and likes.

## Features

- User registration, login/logout and session-based authentication.
- Username availability checks, preset avatars, profile editing and password changes.
- Password hashing with bcrypt.
- Article creation, editing and deletion with author ownership checks.
- Quill rich-text editing and optional image uploads (5 MB limit).
- Article sorting by title, author or date without a full page reload.
- Like/unlike interactions with live counts.
- Comments and replies with a two-level nesting limit, plus permission checks for deletion.
- Account deletion with related records removed through database foreign keys.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript, Handlebars, Fetch API, Quill |
| Backend | Node.js, Express, express-session, Multer |
| Database | MariaDB, SQL joins, foreign keys and indexes |
| Configuration | dotenv and environment variables |

## Architecture

Browser requests are handled by Express routes, which call DAO modules for database access. Routes render Handlebars views or return JSON for interactive features. MariaDB stores user accounts and application content; uploaded images are stored locally.

```text
app.js              Express setup, sessions and route registration
routes/             User, article and comment request handlers
modules/            Database connection pool and DAO modules
views/              Handlebars page templates and browser interactions
public/css/         Page styles
public/avatarImages/ Preset avatars
public/uploads/     Article images
init-db.sql         Schema and sample data
.env.sample         Configuration template
```

## Database design

| Table | Purpose |
| --- | --- |
| users | Account details and password hashes |
| avatars | Preset avatar options |
| articles | Article content linked to its author |
| comments | Comments linked to users, articles and optional parent comments |
| likes | User/article relationships with a composite primary key preventing duplicate likes |

The DAO layer uses parameterised SQL for user-provided values. Dynamic article sort fields are selected from a whitelist. Foreign keys maintain relationships and cascade deletion of dependent records.

## Run locally

Install Node.js/npm and MariaDB. Dependencies are recorded in `package-lock.json`.

```sh
npm ci
```

Create a dedicated development database, then import the schema and sample records:

```sh
mariadb -u your_username -p -e "CREATE DATABASE blog_project;"
mariadb -u your_username -p blog_project < init-db.sql
```

**The initialisation script drops and recreates the application tables. Use a new development database, not one containing data you want to keep.**

Copy `.env.sample` to `.env` and configure your own values:

```sh
cp .env.sample .env
```

```env
EXPRESS_PORT=3000
SESSION_SECRET=replace-with-a-long-random-secret
DB_HOST=localhost
DB_PORT=3306
DB_NAME=blog_project
DB_USER=your_username
DB_PASS=your_password
```

Keep `.env` out of Git. Set `SESSION_SECRET` explicitly: the application includes a coursework fallback that should not be used for a deployed service.

```sh
npm start
```

Open `http://localhost:3000`. Quill is loaded from a CDN, so the rich-text editor requires access to that CDN.

The seed data includes demonstration accounts such as `alice`, `bob` and `charlie`, with the password `password`, as documented in [SETUP.md](SETUP.md). Use these only for local demonstration or create a new account through registration.

## Example endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/article/` | List articles; also supports JSON for sorting |
| POST | `/article/` | Create an article |
| PUT | `/article/:id` | Update an owned article |
| DELETE | `/article/:id` | Delete an owned article |
| POST | `/article/:id/like` | Toggle the current user's like |
| GET | `/comment/article/:articleId` | Retrieve article comments |
| POST | `/comment/` | Add a comment or reply |
| DELETE | `/comment/:id` | Delete a comment with permission checks |

## Design documentation

- [WIREFRAMES.md](WIREFRAMES.md): page layouts and interface planning.
- [USABILITY.md](USABILITY.md): usability considerations.
- [PROJECT_EXPLANATION.md](PROJECT_EXPLANATION.md): detailed implementation notes.

## Project notes

Developed as a coursework project for Programming with Web Technology. This repository demonstrates frontend/backend integration, relational database design and asynchronous browser interactions.

The project currently has no automated test script. This README was checked against the implementation; a fresh end-to-end run was not performed during documentation updates. It is a local demonstration application: sessions use the default in-memory store, and production hardening and deployment are outside the current project scope.
