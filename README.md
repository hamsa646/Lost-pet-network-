# 🐾 Lost Pet Identification and Recovery Network

> **Course:** UE23CS351A – Database Management Systems  
> **Course Level:** Level 3 Experiential Learning Project  
> **Institution:** Department of Computer Science & Engineering, PES University, Bengaluru  
> **Faculty Guide:** Dr. Nagasundari S, Assistant Professor  

---

## 👥 Student Team Details

| Name | USN | Contribution / Role |
|---|---|---|
| **Harshitha Vangaveti** | `PES2UG24AM064` | Relational Schema Design (3NF/BCNF), MySQL DDL/DML, Stored Procedures, ACID Transactions & Next.js API Routes |
| **Hamsa M N** | `PES2UG24AM060` | MongoDB Geospatial (2dsphere) Setup, Aggregation Pipelines, Trigger Design, Views & Next.js Frontend UI |

---

## 🌟 Executive Project Overview

The **Lost Pet Identification and Recovery Network** is an enterprise-grade hybrid database management platform combining **MySQL 8.0** for relational consistency and **MongoDB 7.0** for geospatial proximity tracking. Built for metropolitan Bengaluru, the system resolves urban pet loss by connecting pet owners, animal rescue shelters, and citizen observers.

### Why a Hybrid Database?
1. **MySQL 8.0 (Relational Core):** Guarantees strict **ACID compliance** for legal ownership, microchip records, shelter intake capacities, and multi-table recovery transactions. Fully normalized in **Boyce-Codd Normal Form (BCNF)**.
2. **MongoDB 7.0 (NoSQL Crowdsourcing):** High-throughput ingestion of citizen sightings with **GeoJSON Point** geometries. Powered by a **`2dsphere` spatial index** to execute sub-second proximity queries (`$geoNear`) across Bengaluru neighborhoods (Indiranagar, Koramangala, Whitefield, HSR Layout, etc.).
3. **Next.js 14 Frontend:** Clean, modern, responsive user interface styled with Tailwind CSS, supporting Role-Based Access Control (**Citizen, Shelter Staff, Admin**).

---

## 📁 Clean, Student-Friendly File Structure

The project has been organized with a compact, believable, and clean layout:

```
lost-pet-network/
├── database/
│   ├── database.sql           # Master MySQL Script: DDL (10 tables), Bengaluru seed, queries, 5 views, 2 SPs, 2 functions, 5 triggers, transactions
│   └── mongodb_setup.js       # Master MongoDB Script: collections with validation, 2dsphere index, GeoJSON seed, $geoNear aggregations
├── docs/
│   └── PROJECT_REPORT.md      # Full PES University Academic Report (Cover, Certificate, ERD, BCNF, Data Dictionary, Queries, Testing)
├── lib/
│   ├── db.ts                  # Unified Database Connection: MySQL Connection Pool + MongoDB Client
│   └── auth.ts                # Session management & password verification
├── components/
│   ├── Navbar.tsx             # Responsive Navigation Bar with User Role Badge
│   └── Footer.tsx             # Academic Footer with Student USNs & Faculty info
├── app/
│   ├── layout.tsx             # Root layout with Navbar and Footer
│   ├── globals.css            # Tailwind CSS styling
│   ├── page.tsx               # Landing Page with live database metrics & Bengaluru map overview
│   ├── login/page.tsx         # Unified Sign In & Registration with Role Selection
│   ├── dashboard/page.tsx     # Student Dashboard: KPI cards, active lost alerts, shelter trackers
│   ├── pets/page.tsx          # Registered Pets Registry + "Register Pet" Modal
│   ├── reports/page.tsx       # Lost & Found Incident Center: Browse notices + File reports
│   ├── sightings/page.tsx     # Crowdsourced MongoDB Sightings Map & Proximity Radius Slider
│   ├── matches/page.tsx       # Automated Match Engine: Confidence score % + "Confirm Recovery" (ACID Transaction)
│   ├── admin/page.tsx         # Admin Audit Trail: Live Trigger logs (pet_audit_log) & Shelter Capacity View
│   └── api/                   # Clean Server-Side API Handlers
│       ├── auth/route.ts      # Authentication (Login, Register)
│       ├── pets/route.ts      # MySQL CRUD for Pets
│       ├── reports/route.ts   # MySQL CRUD for Lost & Found Reports
│       ├── sightings/route.ts # MongoDB $geoNear Geospatial API
│       ├── matches/route.ts   # Match Retrieval & sp_confirm_recovery Invocation
│       └── admin/route.ts     # Trigger Audit Log & Shelter Metrics API
├── package.json               # Lean, robust dependencies (Next.js 14, MySQL2, MongoDB, Tailwind)
├── tailwind.config.ts         # Tailwind styling configuration
├── tsconfig.json              # TypeScript configuration
├── .env.local                 # Local environment database credentials
├── .env.example               # Environment variables template
├── PROJECT_REPORT.md          # Copy of Master Academic Report in root for quick inspection
└── README.md                  # This setup and evaluation guide
```

---

## 🚀 Quick 3-Step Setup Instructions

### Step 1: Initialize MySQL Relational Database
1. Open **MySQL Workbench 8.0** or your MySQL command line.
2. Open `database/database.sql` and execute the entire script (or run in terminal):
   ```bash
   mysql -u root -p < database/database.sql
   ```
3. This creates the `lost_pet_network` database, generates 10 normalized tables with primary/foreign keys and constraints, seeds 25+ realistic Bengaluru records, and compiles all Views, Functions, Procedures, Triggers, and Indexes.

### Step 2: Initialize MongoDB Geospatial Collections
1. Ensure MongoDB Server is running on `localhost:27017`.
2. Open terminal and run the master setup script using `mongosh`:
   ```bash
   mongosh "mongodb://localhost:27017" database/mongodb_setup.js
   ```
3. This creates `lost_pet_network_mongo`, establishes `$jsonSchema` validation, builds the `2dsphere` spatial index, inserts Bengaluru GeoJSON sightings, and executes the `$geoNear` aggregation test.

### Step 3: Run Next.js Web Application
1. In the `lost-pet-network` root directory:
   ```bash
   npm install
   npm run dev
   ```
2. Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔑 Demo Login Credentials for Evaluation

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **System Administrator** | `admin@lostpet.org` | `admin123` | Full access to Trigger Audit Logs, Shelter Kennels, and User Management |
| **Pet Owner (Citizen)** | `harshitha@example.com` | `password123` | Register pets, file lost reports, view candidate matches |
| **Shelter Staff** | `staff@cupa.org` | `password123` | Log rescued strays, manage shelter occupancy, process reunions |

---

## 🎓 Evaluator Viva & Rubric Checklist

When presenting this project to **Dr. Nagasundari S**, use this quick guide to locate each rubric criterion:

| # | Rubric Criterion | Where to find it in the Project | Key Details |
|:---:|---|---|---|
| **1** | **Hybrid Database (SQL + NoSQL)** | `database/database.sql`<br/>`database/mongodb_setup.js` | MySQL 8.0 for ACID transactions + MongoDB 7.0 with `2dsphere` GeoJSON index |
| **2** | **Relational Design & BCNF** | `docs/PROJECT_REPORT.md` (Ch. 3 & 4) | 10 tables, complete functional dependencies proof showing all determinants are candidate keys |
| **3** | **DDL Operations** | `database/database.sql` (Section 1) | `CREATE TABLE` with `CHECK` constraints (GPS bounds, rewards > 0), `ALTER TABLE`, and `DROP` examples |
| **4** | **DML Seed Data** | `database/database.sql` (Section 2) | 25+ Bengaluru records across Indiranagar, Koramangala, Whitefield, HSR Layout, etc. |
| **5** | **Queries (JOINs, GROUP BY, HAVING)** | `database/database.sql` (Section 3) | 4-table `INNER JOIN`, zone risk aggregation with `HAVING COUNT(*) > 1` |
| **6** | **Subqueries (Correlated & Nested)** | `database/database.sql` (Section 4) | Pets with higher-than-average reward in their specific zone |
| **7** | **CTEs & Window Functions** | `database/database.sql` (Section 5) | `WITH RankedMatches AS (...)` using `ROW_NUMBER() OVER (PARTITION BY ...)` |
| **8** | **Database Views** | `database/database.sql` (Section 6) | 5 views: `vw_active_lost_pets`, `vw_unclaimed_found_pets`, `vw_shelter_capacity`, `vw_pet_recovery_timeline`, `vw_high_probability_matches` |
| **9** | **Stored Procedures & Functions** | `database/database.sql` (Section 7) | `sp_confirm_recovery`, `sp_find_potential_matches`, `fn_haversine_distance`, `fn_match_score_label` |
| **10** | **Database Triggers** | `database/database.sql` (Section 8) | 5 triggers: auto-update pet status to `'LOST'`, prevent duplicate matches, audit logs, shelter capacity guard |
| **11** | **ACID Transactions** | `database/database.sql` (Section 10) | Multi-table recovery execution using explicit `SAVEPOINT` and `ROLLBACK` |
| **12** | **MongoDB Spatial Proximity** | `database/mongodb_setup.js`<br/>`app/sightings/page.tsx` | Sub-second `$geoNear` radius search around Bengaluru coordinates |
| **13** | **Web Application Interface** | Next.js 14 Web App (`app/`) | Responsive UI, interactive radius sliders, recovery confirmation modal, role-based navigation |
| **14** | **Documentation Report** | `docs/PROJECT_REPORT.md` | Complete PES University format with Certificate, Declaration, ER Diagram, Schema, and Test Cases |
