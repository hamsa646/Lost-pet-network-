# 🐾 Lost Pet Identification and Recovery Network

## Project Overview

The **Lost Pet Identification and Recovery Network** is a DBMS-based project that aims to help people find missing pets by connecting pet owners with community members who report animal sightings.

Pet owners can report missing pets, while community members can submit sightings. The proposed system will identify potential matches using details such as animal type, breed, colour, location and time.

**Project Status:** Work in Progress – the current implementation is focused on the MySQL database. MongoDB and the web application are planned/in progress.

## Objectives

- Provide a platform for reporting lost pets.
- Allow community members to submit animal sightings.
- Identify potential matches between lost-pet reports and sightings.
- Support verification and recording of recovered pets.
- Maintain organized user, pet, report and notification records.

## Technologies

| Technology | Current use/status |
|---|---|
| MySQL | Relational database; SQL schema and sample data are present. |
| MySQL Workbench | Database modelling and SQL execution. |
| MongoDB | Planned NoSQL integration for flexible additional details. |
| Next.js | Planned web application frontend and API layer. |

## Functional Requirements

The system is intended to support the following functions:

1. **User management:** Register users and maintain their details and roles (OWNER, COMMUNITY and ADMIN).
2. **Pet management:** Store pet information, including name, animal type, breed, colour, gender and age.
3. **Lost-pet reporting:** Record a missing pet, its last-seen location, coordinates, date/time, description and report status.
4. **Sighting submission:** Allow community members to record where and when an animal was seen.
5. **Potential-match management:** Store a possible match between a lost report and a sighting, including a match score and status.
6. **Recovery recording:** Record recovery details and the user who verified the recovery.
7. **Notifications:** Store messages for users and whether each notification has been read.

*These are the intended system functions. The complete user-facing application and workflows are not yet implemented.*

## SQL Database – MySQL

The current SQL database is named `lost_pet_network`. The uploaded SQL script creates these seven tables:

| Table | Purpose |
|---|---|
| `Users` | User details, email, password field, phone and role. |
| `Pets` | Pet details and the owner reference. |
| `Lost_Reports` | Lost-pet report details, location, coordinates, date/time and status. |
| `Sightings` | Sighting reporter, location, coordinates and date/time. |
| `Potential_Matches` | Links lost reports with sightings and stores match score/status. |
| `Recovery_Cases` | Stores recovery and verification details. |
| `Notifications` | Stores user messages and read status. |

### SQL concepts present in the script

- `CREATE DATABASE` and `CREATE TABLE` statements.
- Primary keys and auto-increment identifiers.
- Foreign keys to define relationships between tables.
- `UNIQUE`, `NOT NULL` and `CHECK` constraints.
- `ENUM` columns for user roles and report/match statuses.
- `INSERT` statements with sample records.

The SQL file currently contains sample data for the tables. Advanced SQL features such as views, stored procedures, triggers and additional indexes are not included in the uploaded script yet.

## NoSQL Database – MongoDB (Planned)

MongoDB is planned to store additional, flexible information that may vary from one pet report or sighting to another.

Proposed collections:

### `lost_pet_details`
May store additional information linked to a MySQL `report_id`, such as:
- Distinctive physical features.
- Collar or accessory details.
- Behaviour and temperament.
- Additional notes.

### `sighting_details`
May store additional information linked to a MySQL `sighting_id`, such as:
- Visible animal features.
- Observed behaviour.
- Weather or surrounding conditions.
- Additional observations.

**Important:** MongoDB collections and integration are planned, not part of the current uploaded SQL implementation. The `report_id` and `sighting_id` references would logically connect MongoDB documents to their corresponding MySQL records; MongoDB does not enforce MySQL-style foreign keys.

## Proposed System Workflow

1. A user registers on the platform.
2. A pet owner adds pet information.
3. The owner submits a lost-pet report.
4. A community member submits an animal sighting.
5. The system identifies and records potential matches.
6. A possible match is reviewed and verified.
7. Recovery details are recorded and relevant users can be notified.

*The complete application workflow is still under development.*

## Current Development Status

### Completed so far
- Project planning and initial database design.
- MySQL database creation.
- Seven relational table definitions.
- Primary keys, foreign keys and constraints.
- Sample data insertion.
- Initial ER/database model.

### Work in progress / planned
- MongoDB database and collections.
- Next.js frontend.
- Backend/API integration.
- User registration and authentication.
- Lost-pet and sighting submission interfaces.
- Potential-match identification workflow.
- Recovery verification and notifications through the application.
- Integration testing.

## Running the Current SQL Database

1. Install MySQL and MySQL Workbench.
2. Open MySQL Workbench and connect to your MySQL server.
3. Open `lost_pet_network.sql`.
4. Execute the SQL script.
5. Refresh the Schemas panel.
6. Select `lost_pet_network` and inspect its seven tables.

## Project Files

- `lost_pet_network.sql` – database creation, table definitions and sample records.
- `ER Diagram.mwb` – MySQL Workbench model (include this file in the repository if available).

## Team Members

| Member | Name |
|---|---|
| 1 | Harshitha Vangaveti |
| 2 | Hamsa M N |

Both members contribute to database design, implementation and application development.

## Expected Outcome

The expected outcome is a community-driven web application that helps pet owners and community members share information, identify possible sightings and coordinate the recovery of missing pets.

---

**Project Type:** Level 3 – DBMS Experiential Learning Project  
**Project Name:** Lost Pet Identification and Recovery Network  
**Current Phase:** MySQL database implementation and application development
