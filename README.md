# Lost Pet Identification and Recovery Network

A DBMS Level 3 project that provides a web-based workflow for registering pets, reporting lost and found animals, recording community sightings, reviewing potential matches, and managing recovery information.

## Project Overview

The application uses a hybrid database design:

- **MySQL** stores structured, relational records such as users, pets, lost reports, found reports, shelters, shelter intakes, potential matches, recovery cases, notifications, and audit logs.
- **MongoDB** stores flexible pet descriptions, community sightings, activity records, notification queue data, and match history. The setup script defines a GeoJSON location field and a `2dsphere` index for location-based sighting queries.
- **Next.js, React, and TypeScript** provide the web application and server-side API routes.

The project is designed around a Bengaluru lost-pet recovery use case and includes sample data in the database setup scripts.

## Technology Stack

| Area | Technology |
|---|---|
| Web framework | Next.js 14.2 |
| UI library | React 18 |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Relational database | MySQL 8 |
| NoSQL database | MongoDB 7 |
| MySQL driver | `mysql2` |
| MongoDB driver | `mongodb` |
| Password utilities | `bcryptjs` |

## Main Application Areas

The `app/` directory contains these pages:

- `/` — landing page
- `/login` — sign-in and registration interface
- `/dashboard` — dashboard
- `/pets` — pet records
- `/reports` — lost and found reports
- `/sightings` — community sightings
- `/matches` — potential matches
- `/admin` — administration page

Server-side API route files are located in `app/api/`:

- `/api/auth`
- `/api/pets`
- `/api/reports`
- `/api/sightings`
- `/api/matches`
- `/api/admin`

The database connection utilities are in `lib/db.ts`; authentication utilities are in `lib/auth.ts`.

## Repository Structure

```text
lost-pet-network/
├── app/
│   ├── admin/
│   ├── api/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── matches/
│   │   ├── pets/
│   │   ├── reports/
│   │   └── sightings/
│   ├── dashboard/
│   ├── login/
│   ├── matches/
│   ├── pets/
│   ├── reports/
│   ├── sightings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Footer.tsx
│   └── Navbar.tsx
├── database/
│   ├── database.sql
│   └── mongodb_setup.js
├── docs/
│   └── PROJECT_REPORT.md
├── lib/
│   ├── auth.ts
│   └── db.ts
├── public/
├── types/
├── .env.example
├── package.json
├── package-lock.json
├── PROJECT_REPORT.md
└── README.md
```

## Prerequisites

Install the following before running the project:

1. Node.js and npm.
2. MySQL Server 8.x and a MySQL client such as MySQL Workbench.
3. MongoDB Server 7.x and MongoDB Shell (`mongosh`).

Ensure both database servers are running before starting the application.

## Setup and Run

### 1. Get the project and install dependencies

```bash
git clone https://github.com/hamsa646/Lost-pet-network-.git
cd Lost-pet-network-
npm install
```

### 2. Configure environment variables

Create a local environment file from the supplied example.

On Windows Command Prompt:

```cmd
copy .env.example .env.local
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the credentials and database names for your local database services:

```dotenv
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=lost_pet_network

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=lost_pet_network_mongo

NEXT_PUBLIC_APP_NAME="Lost Pet Identification and Recovery Network"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not commit `.env.local` or real database credentials to GitHub. The repository's `.gitignore` excludes local environment files.

### 3. Set up MySQL

The MySQL setup script is `database/database.sql`. It creates the `lost_pet_network` database, defines the relational tables and constraints, inserts sample data, and includes SQL examples and advanced database objects.

You can execute it using MySQL Workbench, or from a terminal:

```bash
mysql -u root -p < database/database.sql
```

**Important:** The script starts with `DROP DATABASE IF EXISTS lost_pet_network;`. Running it again deletes and recreates that database, including its existing data. Back up any data you need before executing the script.

### 4. Set up MongoDB

Run the MongoDB setup script from the project root using `mongosh`:

```bash
mongosh "mongodb://localhost:27017" --file database/mongodb_setup.js
```

The script uses the `lost_pet_network_mongo` database. It creates collections for sightings, pet descriptions, activity logs, a notifications queue, and match history; it also creates indexes, including a `2dsphere` index for sighting locations, and inserts sample documents.

**Important:** The script drops and recreates the collections it manages. Running it again replaces the existing contents of those collections with the script's setup and sample data.

### 5. Start the web application

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

To create a production build and run it:

```bash
npm run build
npm start
```

## Database Design Summary

### MySQL relational tables

The supplied SQL script defines these ten tables:

1. `users`
2. `pets`
3. `lost_reports`
4. `found_reports`
5. `shelters`
6. `shelter_intakes`
7. `potential_matches`
8. `recovery_cases`
9. `notifications`
10. `audit_logs`

The schema uses primary keys, foreign keys, unique constraints, check constraints, and timestamp fields to represent relationships and maintain data integrity.

The SQL script also contains sample DDL and DML, analytical queries, views, stored procedures, stored functions, triggers, indexes, and transaction examples. Refer to the SQL file itself for the exact definitions and execution order.

### MongoDB collections

The supplied MongoDB setup script creates:

- `sightings`
- `pet_descriptions`
- `activity_logs`
- `notifications_queue`
- `match_history`

The `sightings` collection stores GeoJSON `Point` locations and has a `2dsphere` index. The script also creates additional indexes for common lookup and sorting fields.

## Team

| Team member | USN |
|---|---|
| Harshitha Vangaveti | PES2UG24AM064 |
| Hamsa M N | PES2UG24AM060 |


## Important Notes

- The database setup scripts contain sample data intended for project demonstration and testing.
- Configure your own local database credentials in `.env.local` before running the application.
- Never publish passwords, API secrets, or production database credentials.
- The README describes the files and setup scripts included in the project archive. For the definitive implementation details, consult the source code in `app/`, `lib/`, and `database/`.
