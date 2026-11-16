-- =============================================================================
-- PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
-- DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
-- =============================================================================
-- Project Title: Lost Pet Identification and Recovery Network
-- Team Members:
--   1. Harshitha Vangaveti  (USN: PES2UG24AM064)
--   2. Hamsa M N            (USN: PES2UG24AM060)
-- Course Code: UE24CS351A
-- Faculty Guide: Dr. Nagasundari S
-- Academic Term: AUG - DEC 2026
-- =============================================================================
-- This single comprehensive SQL script contains the complete relational implementation:
--   1. DDL: Database creation, Table structures, Keys, Constraints, ALTER & DROP
--   2. DML: Realistic Bangalore seed dataset
--   3. Queries: JOINs, GROUP BY, HAVING, Subqueries, CTEs, Window Functions
--   4. Advanced Features: Views, Stored Procedures, Functions, Triggers, Indexes, Transactions
-- =============================================================================

-- =============================================================================
-- SECTION 1: DDL - DATABASE SETUP & TABLE CREATION
-- =============================================================================

DROP DATABASE IF EXISTS lost_pet_network;
CREATE DATABASE lost_pet_network
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE lost_pet_network;

-- Table 1: users (Stores account profiles with role-based access)
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(15),
    address       TEXT,
    role          ENUM('OWNER', 'FINDER', 'SHELTER_STAFF', 'ADMIN') NOT NULL DEFAULT 'OWNER',
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 2: pets (Stores pet biometric profiles registered by owners)
CREATE TABLE pets (
    pet_id             INT AUTO_INCREMENT PRIMARY KEY,
    owner_id           INT NOT NULL,
    pet_name           VARCHAR(100) NOT NULL,
    animal_type        ENUM('DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER') NOT NULL,
    breed              VARCHAR(100),
    age                INT,
    gender             ENUM('MALE', 'FEMALE', 'UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
    color_description  VARCHAR(255) NOT NULL,
    distinctive_marks  TEXT,
    microchip_id       VARCHAR(50) UNIQUE,
    photo_url          VARCHAR(500),
    is_active          BOOLEAN DEFAULT TRUE,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_pet_age CHECK (age >= 0 AND age <= 50)
) ENGINE=InnoDB;

-- Table 3: lost_reports (Active and historical lost pet notices)
CREATE TABLE lost_reports (
    report_id          INT AUTO_INCREMENT PRIMARY KEY,
    pet_id             INT NOT NULL,
    reported_by        INT NOT NULL,
    lost_date          DATE NOT NULL,
    last_seen_location VARCHAR(500) NOT NULL,
    latitude           DECIMAL(10,8),
    longitude          DECIMAL(11,8),
    description        TEXT,
    status             ENUM('ACTIVE', 'RESOLVED', 'EXPIRED', 'UNDER_INVESTIGATION') NOT NULL DEFAULT 'ACTIVE',
    reward_amount      DECIMAL(10,2) DEFAULT 0.00,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lost_pet FOREIGN KEY (pet_id) 
        REFERENCES pets(pet_id) ON DELETE RESTRICT,
    CONSTRAINT fk_lost_reporter FOREIGN KEY (reported_by) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_reward_positive CHECK (reward_amount >= 0.00)
) ENGINE=InnoDB;

-- Table 4: found_reports (Stray / found animals reported by community)
CREATE TABLE found_reports (
    found_report_id    INT AUTO_INCREMENT PRIMARY KEY,
    finder_id          INT NOT NULL,
    animal_type        ENUM('DOG', 'CAT', 'BIRD', 'RABBIT', 'OTHER') NOT NULL,
    breed_guess        VARCHAR(100),
    color_description  VARCHAR(255) NOT NULL,
    found_date         DATE NOT NULL,
    found_location     VARCHAR(500) NOT NULL,
    latitude           DECIMAL(10,8),
    longitude          DECIMAL(11,8),
    photo_url          VARCHAR(500),
    description        TEXT,
    status             ENUM('UNCLAIMED', 'MATCHED', 'SHELTERED') NOT NULL DEFAULT 'UNCLAIMED',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_found_finder FOREIGN KEY (finder_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 5: shelters (Registered animal shelters and rescue shelters)
CREATE TABLE shelters (
    shelter_id         INT AUTO_INCREMENT PRIMARY KEY,
    shelter_name       VARCHAR(200) NOT NULL,
    contact_person     VARCHAR(100),
    email              VARCHAR(150) NOT NULL UNIQUE,
    phone              VARCHAR(15) NOT NULL,
    address            TEXT NOT NULL,
    latitude           DECIMAL(10,8),
    longitude          DECIMAL(11,8),
    capacity           INT NOT NULL DEFAULT 50,
    current_count      INT NOT NULL DEFAULT 0,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_shelter_capacity CHECK (current_count <= capacity AND current_count >= 0)
) ENGINE=InnoDB;

-- Table 6: shelter_intakes (Animals admitted to physical shelters)
CREATE TABLE shelter_intakes (
    intake_id          INT AUTO_INCREMENT PRIMARY KEY,
    shelter_id         INT NOT NULL,
    found_report_id    INT,
    intake_date        DATE NOT NULL,
    hold_until_date    DATE,
    status             ENUM('HOLDING', 'ADOPTED', 'RECLAIMED', 'TRANSFERRED') NOT NULL DEFAULT 'HOLDING',
    notes              TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_intake_shelter FOREIGN KEY (shelter_id) 
        REFERENCES shelters(shelter_id) ON DELETE CASCADE,
    CONSTRAINT fk_intake_found_report FOREIGN KEY (found_report_id) 
        REFERENCES found_reports(found_report_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 7: potential_matches (Automated match candidates linking lost & found pets)
CREATE TABLE potential_matches (
    match_id           INT AUTO_INCREMENT PRIMARY KEY,
    report_id          INT NOT NULL,
    found_report_id    INT NOT NULL,
    match_score        DECIMAL(5,2) NOT NULL,
    match_status       ENUM('PENDING', 'CONFIRMED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    matched_by         INT,
    matched_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes              TEXT,
    CONSTRAINT fk_match_lost FOREIGN KEY (report_id) 
        REFERENCES lost_reports(report_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_found FOREIGN KEY (found_report_id) 
        REFERENCES found_reports(found_report_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_verifier FOREIGN KEY (matched_by) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_match_score_range CHECK (match_score >= 0.00 AND match_score <= 100.00)
) ENGINE=InnoDB;

-- Table 8: recovery_cases (Final verified recovery records)
CREATE TABLE recovery_cases (
    case_id            INT AUTO_INCREMENT PRIMARY KEY,
    match_id           INT NOT NULL UNIQUE,
    report_id          INT NOT NULL,
    confirmed_by       INT NOT NULL,
    recovered_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recovery_notes     TEXT,
    CONSTRAINT fk_recovery_match FOREIGN KEY (match_id) 
        REFERENCES potential_matches(match_id) ON DELETE CASCADE,
    CONSTRAINT fk_recovery_report FOREIGN KEY (report_id) 
        REFERENCES lost_reports(report_id) ON DELETE CASCADE,
    CONSTRAINT fk_recovery_confirmer FOREIGN KEY (confirmed_by) 
        REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 9: notifications (User alerts for matches and updates)
CREATE TABLE notifications (
    notification_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT NOT NULL,
    notification_type  VARCHAR(50) NOT NULL,
    message            TEXT NOT NULL,
    is_read            BOOLEAN DEFAULT FALSE,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 10: audit_logs (System-level action and state audit trails)
CREATE TABLE audit_logs (
    log_id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id            INT,
    action             VARCHAR(100) NOT NULL,
    table_name         VARCHAR(100) NOT NULL,
    record_id          INT,
    old_values         JSON,
    new_values         JSON,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Demonstration of ALTER statement (Requirement 5 in syllabus)
ALTER TABLE pets ADD COLUMN emergency_contact VARCHAR(15) NULL AFTER distinctive_marks;
ALTER TABLE pets DROP COLUMN emergency_contact;


-- =============================================================================
-- SECTION 2: DML - REALISTIC SEED DATA (BENGALURU DATASET)
-- =============================================================================

-- 1. Users (10 users covering all 4 roles)
INSERT INTO users (full_name, email, password_hash, phone, address, role) VALUES
('Harshitha Vangaveti', 'harshitha.v@lostpetnetwork.in', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9876543210', '14, Koramangala 5th Block, Bengaluru', 'ADMIN'),
('Hamsa M N', 'hamsa.mn@lostpetnetwork.in', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9845678901', '22, Indiranagar 100ft Road, Bengaluru', 'SHELTER_STAFF'),
('Rajesh Kumar', 'rajesh.kumar@gmail.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9731234567', '7, Jayanagar 4th Block, Bengaluru', 'OWNER'),
('Priya Nair', 'priya.nair@gmail.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9845123456', '3, HSR Layout Sector 2, Bengaluru', 'OWNER'),
('Arjun Sharma', 'arjun.sharma@yahoo.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '8123456789', '55, Whitefield Main Road, Bengaluru', 'OWNER'),
('Deepika Reddy', 'deepika.reddy@outlook.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '7654321098', '12, BTM Layout 2nd Stage, Bengaluru', 'OWNER'),
('Suresh Pillai', 'suresh.pillai@gmail.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9900112233', '8, Malleshwaram 15th Cross, Bengaluru', 'FINDER'),
('Ananya Krishnan', 'ananya.krishnan@gmail.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '8800223344', '41, Electronic City Phase 1, Bengaluru', 'FINDER'),
('Dr. Ramesh Rao', 'ramesh.rao@cupashelter.org', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9448112233', 'Kengeri Satellite Town, Bengaluru', 'SHELTER_STAFF'),
('Vikram Mehta', 'vikram.mehta@gmail.com', '$2b$12$KIXJz5bKpWx7HkQmR3eLvO8jEkUQhW2vZ0P1LcTfYnBdHmGaI4sSu', '9112233445', '19, Sadashivanagar, Bengaluru', 'OWNER');

-- 2. Pets (10 pet master profiles)
INSERT INTO pets (owner_id, pet_name, animal_type, breed, age, gender, color_description, distinctive_marks, microchip_id, photo_url) VALUES
(3, 'Buddy', 'DOG', 'Golden Retriever', 3, 'MALE', 'Golden Caramel', 'White patch on chest, answers to Buddy', '985141002345678', 'https://images.unsplash.com/photo-1552053831-71594a27632d'),
(3, 'Rocky', 'DOG', 'Labrador Retriever', 2, 'MALE', 'Jet Black', 'White spot on chin, notched left ear', '985141003456789', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e'),
(4, 'Snowy', 'CAT', 'Persian', 2, 'FEMALE', 'Pure White', 'Sapphire blue eyes, tiny pink nose freckle', '985141009876543', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba'),
(5, 'Max', 'DOG', 'German Shepherd', 4, 'MALE', 'Black and Tan', 'Scar on left hind leg, black saddle', '985141004567890', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455'),
(6, 'Bella', 'DOG', 'Beagle', 3, 'FEMALE', 'Tricolor (White, Black, Brown)', 'White tip on tail (beagle flag)', '985141005678901', 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2'),
(4, 'Milo', 'CAT', 'Domestic Shorthair', 1, 'MALE', 'Orange Tabby', 'Four white paws (white socks)', NULL, 'https://images.unsplash.com/photo-1574158622682-e40e69881006'),
(10, 'Coco', 'DOG', 'Labrador Retriever', 5, 'FEMALE', 'Chocolate Brown', 'Graying muzzle, very gentle', '985141006789012', 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef'),
(10, 'Simba', 'CAT', 'Persian', 3, 'MALE', 'Golden Amber', 'Bushy tail, flat face', NULL, 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce'),
(6, 'Bruno', 'DOG', 'Pug', 4, 'MALE', 'Black', 'Double curled tail, snorting breath', '985141007890123', 'https://images.unsplash.com/photo-1517849845537-4d257902454a'),
(3, 'Rio', 'BIRD', 'Lovebird', 1, 'MALE', 'Green and Peach', 'Closed metal identification ring on left leg', NULL, 'https://images.unsplash.com/photo-1544717305-2782549b5136');

-- 3. Lost Reports (8 lost notices)
INSERT INTO lost_reports (pet_id, reported_by, lost_date, last_seen_location, latitude, longitude, description, status, reward_amount) VALUES
(1, 3, '2026-11-05', 'Koramangala 4th Block near Sony World Signal', 12.93440000, 77.62710000, 'Slipped collar while walking near park. Very friendly.', 'ACTIVE', 5000.00),
(3, 4, '2026-11-08', '100 Feet Road, Indiranagar near 12th Main', 12.97840000, 77.64120000, 'Persian cat jumped from balcony, timid.', 'ACTIVE', 3000.00),
(5, 6, '2026-11-10', 'HSR Layout Sector 2 near BDA Complex', 12.91210000, 77.63500000, 'Beagle ran following food scent, wearing blue collar.', 'ACTIVE', 2500.00),
(4, 5, '2026-11-03', 'Jayanagar 4th Block Shopping Complex', 12.92990000, 77.58550000, 'Large German Shepherd, answers to Max. Trained dog.', 'RESOLVED', 10000.00),
(9, 6, '2026-11-12', 'BTM Layout 2nd Stage near Udupi Garden', 12.91650000, 77.60800000, 'Small black pug, panting heavily in afternoon.', 'ACTIVE', 1500.00),
(6, 4, '2026-11-01', 'Whitefield Main Road near Hope Farm', 12.96980000, 77.74990000, 'Ginger tabby cat with white socks.', 'EXPIRED', 1000.00),
(10, 3, '2026-10-28', '8th Cross, Malleshwaram near CTR', 13.00350000, 77.56800000, 'Small green lovebird flew out of cage.', 'ACTIVE', 1000.00),
(2, 3, '2026-11-14', 'Electronic City Phase 1 near Velankani', 12.84500000, 77.68500000, 'Black lab, very energetic, loves fetch.', 'ACTIVE', 2000.00);

-- 4. Found Reports (6 found stray notices)
INSERT INTO found_reports (finder_id, animal_type, breed_guess, color_description, found_date, found_location, latitude, longitude, photo_url, description, status) VALUES
(7, 'DOG', 'Golden Retriever', 'Golden with white chest patch', '2026-11-07', 'Near Bethany High School, Koramangala 6th Block', 12.92790000, 77.63200000, 'https://images.unsplash.com/photo-1552053831-71594a27632d', 'Found friendly golden dog with red faded collar.', 'MATCHED'),
(8, 'CAT', 'Persian', 'White fluffy cat with blue eyes', '2026-11-09', '12th Main Road, Indiranagar', 12.97190000, 77.63800000, 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', 'Found hiding near bakery dumpster, very clean.', 'UNCLAIMED'),
(8, 'DOG', 'Beagle', 'Tricolor white, black, brown', '2026-11-11', 'Sector 1, HSR Layout near 27th Main', 12.91000000, 77.63900000, 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2', 'Found beagle with floppy ears sniffing food stalls.', 'UNCLAIMED'),
(7, 'DOG', 'German Shepherd', 'Black and Tan large dog', '2026-11-04', 'Jayanagar 7th Block park', 12.92500000, 77.58100000, 'https://images.unsplash.com/photo-1589941013453-ec89f33b5455', 'Very obedient dog secured by apartment guards.', 'MATCHED'),
(8, 'CAT', 'Domestic Shorthair', 'Grey and white tabby', '2026-11-10', 'HAL 2nd Stage, Indiranagar', 12.97500000, 77.64000000, NULL, 'Found stray cat sitting on compound wall.', 'UNCLAIMED'),
(7, 'DOG', 'Pug', 'Black pug, very small', '2026-11-13', 'BTM Water Tank Road', 12.91500000, 77.60500000, NULL, 'Found panting pug, gave water.', 'SHELTERED');

-- 5. Shelters (3 Bangalore rescue shelters)
INSERT INTO shelters (shelter_name, contact_person, email, phone, address, latitude, longitude, capacity, current_count) VALUES
('CUPA Second Chance Sanctuary', 'Dr. Ramesh Rao', 'cupa.blr@shelter.org', '08022947300', 'Survey 40, Silk Board Junction, Koramangala, Bengaluru', 12.91720000, 77.62280000, 60, 35),
('CARE (Charlie's Animal Rescue Centre)', 'Sudha Narayanan', 'care.blr@shelter.org', '09483916058', 'Mallasandra Village, Jakkur, Bengaluru', 13.07820000, 77.60690000, 40, 22),
('VOSD (Voice of Stray Dogs)', 'Rakesh Shukla', 'info@vosd.in', '08041122334', 'Whitefield Industrial Area, Bengaluru', 12.98500000, 77.73200000, 80, 50);

-- 6. Shelter Intakes (3 intakes)
INSERT INTO shelter_intakes (shelter_id, found_report_id, intake_date, hold_until_date, status, notes) VALUES
(1, 1, '2026-11-07', '2026-11-21', 'RECLAIMED', 'Reclaimed by owner Rajesh Kumar after chip verification.'),
(1, 6, '2026-11-13', '2026-11-27', 'HOLDING', 'Black pug under medical observation for mild dehydration.'),
(2, 3, '2026-11-11', '2026-11-25', 'HOLDING', 'Rescued Beagle in good health, awaiting owner confirmation.');

-- 7. Potential Matches (6 match evaluations)
INSERT INTO potential_matches (report_id, found_report_id, match_score, match_status, matched_by, notes) VALUES
(1, 1, 92.50, 'CONFIRMED', 1, 'High probability match: Species DOG, Breed Golden Retriever, Location < 1.5km.'),
(2, 2, 76.00, 'PENDING', 2, 'Species CAT, Persian, color match, location Indiranagar.'),
(3, 3, 88.00, 'PENDING', 2, 'Species DOG, Beagle, tricolor markings, HSR Layout within 1 km.'),
(4, 4, 95.00, 'CONFIRMED', 1, 'Exact microchip match #985141004567890 verified by scanner.'),
(2, 5, 55.00, 'REJECTED', 2, 'Species match but color differs (pure white vs grey tabby).'),
(5, 6, 85.00, 'PENDING', 2, 'Species DOG, Pug, Black, BTM Layout proximity match.');

-- 8. Recovery Cases (2 confirmed reunifications)
INSERT INTO recovery_cases (match_id, report_id, confirmed_by, recovered_at, recovery_notes) VALUES
(1, 1, 1, '2026-11-09 18:00:00', 'Owner Rajesh Kumar verified Buddy through microchip scanner and collar.'),
(4, 4, 1, '2026-11-06 15:30:00', 'Max safely reunited with Arjun Sharma at Jayanagar.');

-- 9. Notifications
INSERT INTO notifications (user_id, notification_type, message) VALUES
(3, 'MATCH_FOUND', 'A 92.5% match for your pet Buddy was identified in Koramangala!'),
(3, 'RECOVERY_CONFIRMED', 'Great news! Report #1 has been confirmed and Buddy is safe!'),
(4, 'MATCH_FOUND', 'A 76% potential match for Snowy was spotted in Indiranagar.'),
(5, 'MATCH_CONFIRMED', 'Max has been verified and marked as recovered.'),
(6, 'MATCH_FOUND', 'Potential Beagle match identified near HSR Sector 1.');

-- 10. Audit Logs
INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values) VALUES
(1, 'USER_LOGIN', 'users', 1, JSON_OBJECT('user', 'Harshitha Vangaveti', 'role', 'ADMIN')),
(3, 'CREATE_LOST_REPORT', 'lost_reports', 1, JSON_OBJECT('pet', 'Buddy', 'reward', 5000.00)),
(1, 'CONFIRM_RECOVERY', 'recovery_cases', 1, JSON_OBJECT('report_id', 1, 'status', 'RESOLVED')),
(4, 'CREATE_LOST_REPORT', 'lost_reports', 2, JSON_OBJECT('pet', 'Snowy', 'reward', 3000.00));


-- =============================================================================
-- SECTION 3: DML QUERIES - SELECT, JOIN, AGGREGATE, GROUP BY & HAVING
-- =============================================================================

-- Query 3.1: [INNER JOIN] Active lost reports with pet biometric profile and owner phone
SELECT 
    lr.report_id,
    p.pet_name,
    p.animal_type,
    p.breed,
    p.microchip_id,
    u.full_name AS owner_name,
    u.phone AS contact_number,
    lr.last_seen_location,
    lr.lost_date,
    lr.reward_amount
FROM lost_reports lr
INNER JOIN pets p ON lr.pet_id = p.pet_id
INNER JOIN users u ON p.owner_id = u.user_id
WHERE lr.status = 'ACTIVE'
ORDER BY lr.lost_date DESC;

-- Query 3.2: [LEFT JOIN] All pets and their corresponding lost report status
SELECT 
    p.pet_id,
    p.pet_name,
    p.animal_type,
    p.breed,
    u.full_name AS owner_name,
    COALESCE(lr.status, 'SAFE AT HOME') AS case_status,
    lr.lost_date
FROM pets p
INNER JOIN users u ON p.owner_id = u.user_id
LEFT JOIN lost_reports lr ON p.pet_id = lr.pet_id
ORDER BY case_status, p.pet_name;

-- Query 3.3: [GROUP BY with HAVING & Aggregates] Lost reports per species with average reward
SELECT 
    p.animal_type,
    COUNT(lr.report_id) AS total_lost_notices,
    SUM(CASE WHEN lr.status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_cases,
    ROUND(AVG(lr.reward_amount), 2) AS avg_reward_offered,
    MAX(lr.reward_amount) AS max_reward_offered
FROM pets p
JOIN lost_reports lr ON p.pet_id = lr.pet_id
GROUP BY p.animal_type
HAVING COUNT(lr.report_id) >= 1
ORDER BY total_lost_notices DESC;

-- Query 3.4: [Shelter Capacity Analysis with HAVING]
SELECT 
    s.shelter_name,
    s.capacity,
    s.current_count,
    ROUND((s.current_count / s.capacity) * 100, 1) AS occupancy_pct,
    COUNT(si.intake_id) AS recorded_intakes
FROM shelters s
LEFT JOIN shelter_intakes si ON s.shelter_id = si.shelter_id
GROUP BY s.shelter_id, s.shelter_name, s.capacity, s.current_count
HAVING occupancy_pct >= 40.0
ORDER BY occupancy_pct DESC;


-- =============================================================================
-- SECTION 4: SUBQUERIES (NON-CORRELATED & CORRELATED)
-- =============================================================================

-- Query 4.1: [Non-Correlated Subquery] Reports offering rewards higher than the average
SELECT 
    lr.report_id,
    p.pet_name,
    lr.last_seen_location,
    lr.reward_amount
FROM lost_reports lr
JOIN pets p ON lr.pet_id = p.pet_id
WHERE lr.reward_amount > (
    SELECT AVG(reward_amount) FROM lost_reports WHERE reward_amount > 0
)
ORDER BY lr.reward_amount DESC;

-- Query 4.2: [Correlated Subquery with EXISTS] Pets that have an ACTIVE lost report
SELECT 
    p.pet_id,
    p.pet_name,
    p.animal_type,
    p.breed
FROM pets p
WHERE EXISTS (
    SELECT 1 
    FROM lost_reports lr 
    WHERE lr.pet_id = p.pet_id AND lr.status = 'ACTIVE'
);

-- Query 4.3: [Correlated Subquery with NOT EXISTS] Registered owners who have never lost a pet
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone
FROM users u
WHERE u.role = 'OWNER'
  AND NOT EXISTS (
      SELECT 1 
      FROM pets p 
      JOIN lost_reports lr ON p.pet_id = lr.pet_id 
      WHERE p.owner_id = u.user_id
  );


-- =============================================================================
-- SECTION 5: ADVANCED SQL - CTEs & ANALYTICAL WINDOW FUNCTIONS
-- =============================================================================

-- Query 5.1: [Common Table Expression - CTE] High-confidence matches above platform average
WITH platform_average AS (
    SELECT AVG(match_score) AS avg_score FROM potential_matches
),
high_matches AS (
    SELECT 
        pm.match_id,
        p.pet_name AS lost_pet,
        p.animal_type,
        pm.match_score,
        fr.found_location,
        u.full_name AS owner_name
    FROM potential_matches pm
    JOIN lost_reports lr ON pm.report_id = lr.report_id
    JOIN pets p ON lr.pet_id = p.pet_id
    JOIN users u ON p.owner_id = u.user_id
    JOIN found_reports fr ON pm.found_report_id = fr.found_report_id
    CROSS JOIN platform_average pa
    WHERE pm.match_score > pa.avg_score
)
SELECT * FROM high_matches
ORDER BY match_score DESC;

-- Query 5.2: [Window Functions: RANK() & ROW_NUMBER()] Rank matches partitioned by species
SELECT 
    pm.match_id,
    p.animal_type,
    p.pet_name,
    pm.match_score,
    ROW_NUMBER() OVER (PARTITION BY p.animal_type ORDER BY pm.match_score DESC) AS row_num,
    RANK() OVER (PARTITION BY p.animal_type ORDER BY pm.match_score DESC) AS rank_in_species,
    DENSE_RANK() OVER (PARTITION BY p.animal_type ORDER BY pm.match_score DESC) AS dense_rank_in_species
FROM potential_matches pm
JOIN lost_reports lr ON pm.report_id = lr.report_id
JOIN pets p ON lr.pet_id = p.pet_id;

-- Query 5.3: [Window Functions: LAG() & LEAD()] Compare match score against neighboring candidates
SELECT 
    pm.match_id,
    pm.match_score,
    LAG(pm.match_score, 1) OVER (ORDER BY pm.match_score DESC) AS higher_score,
    LEAD(pm.match_score, 1) OVER (ORDER BY pm.match_score DESC) AS lower_score,
    ROUND(pm.match_score - LEAD(pm.match_score, 1) OVER (ORDER BY pm.match_score DESC), 2) AS margin_to_next
FROM potential_matches pm
ORDER BY pm.match_score DESC;


-- =============================================================================
-- SECTION 6: VIEWS (5 MEANINGFUL DATABASE VIEWS)
-- =============================================================================

-- View 1: Active lost pets master view
CREATE OR REPLACE VIEW vw_active_lost_pets AS
SELECT 
    lr.report_id,
    p.pet_id,
    p.pet_name,
    p.animal_type,
    p.breed,
    p.color_description,
    p.microchip_id,
    p.photo_url,
    u.full_name AS owner_name,
    u.phone AS owner_phone,
    lr.last_seen_location,
    lr.lost_date,
    DATEDIFF(CURDATE(), lr.lost_date) AS days_missing,
    lr.reward_amount,
    lr.status
FROM lost_reports lr
JOIN pets p ON lr.pet_id = p.pet_id
JOIN users u ON p.owner_id = u.user_id
WHERE lr.status IN ('ACTIVE', 'UNDER_INVESTIGATION');

-- View 2: Pet match comparison view
CREATE OR REPLACE VIEW vw_pet_match_summary AS
SELECT 
    pm.match_id,
    pm.match_score,
    pm.match_status,
    p.pet_name AS lost_pet_name,
    p.animal_type,
    p.breed AS lost_breed,
    u_owner.full_name AS owner_name,
    lr.last_seen_location,
    fr.found_location,
    fr.found_date,
    u_finder.full_name AS finder_name
FROM potential_matches pm
JOIN lost_reports lr ON pm.report_id = lr.report_id
JOIN pets p ON lr.pet_id = p.pet_id
JOIN users u_owner ON p.owner_id = u_owner.user_id
JOIN found_reports fr ON pm.found_report_id = fr.found_report_id
JOIN users u_finder ON fr.finder_id = u_finder.user_id;

-- View 3: Shelter capacity utilization view
CREATE OR REPLACE VIEW vw_shelter_capacity_status AS
SELECT 
    s.shelter_id,
    s.shelter_name,
    s.contact_person,
    s.phone,
    s.email,
    s.address,
    s.capacity,
    s.current_count,
    (s.capacity - s.current_count) AS available_slots,
    ROUND((s.current_count / s.capacity) * 100, 1) AS utilization_rate_pct,
    CASE 
        WHEN (s.current_count / s.capacity) >= 0.85 THEN 'CRITICAL (Near Full)'
        WHEN (s.current_count / s.capacity) >= 0.60 THEN 'MODERATE OCCUPANCY'
        ELSE 'AVAILABLE SPACE'
    END AS occupancy_status
FROM shelters s;

-- View 4: Monthly recovery analytics view
CREATE OR REPLACE VIEW vw_recovery_success_analytics AS
SELECT 
    DATE_FORMAT(rc.recovered_at, '%Y-%m') AS recovery_month,
    COUNT(rc.case_id) AS total_reunited_pets,
    p.animal_type,
    ROUND(AVG(DATEDIFF(rc.recovered_at, lr.lost_date)), 1) AS avg_days_to_recovery
FROM recovery_cases rc
JOIN potential_matches pm ON rc.match_id = pm.match_id
JOIN lost_reports lr ON rc.report_id = lr.report_id
JOIN pets p ON lr.pet_id = p.pet_id
GROUP BY DATE_FORMAT(rc.recovered_at, '%Y-%m'), p.animal_type;

-- View 5: Unclaimed found animals view
CREATE OR REPLACE VIEW vw_unclaimed_found_animals AS
SELECT 
    fr.found_report_id,
    fr.animal_type,
    fr.breed_guess,
    fr.color_description,
    fr.found_date,
    fr.found_location,
    fr.photo_url,
    u.full_name AS finder_name,
    u.phone AS finder_phone
FROM found_reports fr
JOIN users u ON fr.finder_id = u.user_id
WHERE fr.status = 'UNCLAIMED';


-- =============================================================================
-- SECTION 7: STORED PROCEDURES & USER-DEFINED FUNCTIONS
-- =============================================================================

-- Function 1: Categorical label for match score
DROP FUNCTION IF EXISTS fn_match_score_label;
DELIMITER //
CREATE FUNCTION fn_match_score_label(score DECIMAL(5,2))
RETURNS VARCHAR(20)
DETERMINISTIC
NO SQL
BEGIN
    IF score >= 90.00 THEN RETURN 'VERY HIGH';
    ELSEIF score >= 75.00 THEN RETURN 'HIGH';
    ELSEIF score >= 50.00 THEN RETURN 'MODERATE';
    ELSE RETURN 'LOW';
    END IF;
END //
DELIMITER ;

-- Function 2: Geographic Haversine distance in km
DROP FUNCTION IF EXISTS fn_haversine_distance;
DELIMITER //
CREATE FUNCTION fn_haversine_distance(
    lat1 DECIMAL(10,8), lon1 DECIMAL(11,8),
    lat2 DECIMAL(10,8), lon2 DECIMAL(11,8)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
NO SQL
BEGIN
    DECLARE dLat DOUBLE;
    DECLARE dLon DOUBLE;
    DECLARE a DOUBLE;
    DECLARE c DOUBLE;
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    SET dLat = RADIANS(lat2 - lat1);
    SET dLon = RADIANS(lon2 - lon1);
    SET a = SIN(dLat/2)*SIN(dLat/2) + COS(RADIANS(lat1))*COS(RADIANS(lat2))*SIN(dLon/2)*SIN(dLon/2);
    SET c = 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN ROUND(6371.0 * c, 2);
END //
DELIMITER ;

-- Procedure 1: Auto-generate matches based on species, breed and location
DROP PROCEDURE IF EXISTS sp_find_potential_matches;
DELIMITER //
CREATE PROCEDURE sp_find_potential_matches(IN p_report_id INT)
BEGIN
    DECLARE v_type VARCHAR(50);
    DECLARE v_breed VARCHAR(100);
    DECLARE v_lat DECIMAL(10,8);
    DECLARE v_lon DECIMAL(11,8);
    DECLARE v_date DATE;

    SELECT p.animal_type, p.breed, lr.latitude, lr.longitude, lr.lost_date
    INTO v_type, v_breed, v_lat, v_lon, v_date
    FROM lost_reports lr
    JOIN pets p ON lr.pet_id = p.pet_id
    WHERE lr.report_id = p_report_id;

    INSERT INTO potential_matches (report_id, found_report_id, match_score, match_status, notes)
    SELECT 
        p_report_id,
        fr.found_report_id,
        LEAST(100.00, (
            35.00 +
            (CASE WHEN LOWER(fr.breed_guess) = LOWER(v_breed) THEN 25.00 ELSE 5.00 END) +
            (CASE WHEN v_lat IS NOT NULL AND fr.latitude IS NOT NULL AND fn_haversine_distance(v_lat, v_lon, fr.latitude, fr.longitude) <= 5.0 THEN 20.00 ELSE 5.00 END) +
            (CASE WHEN ABS(DATEDIFF(fr.found_date, v_date)) <= 14 THEN 15.00 ELSE 0.00 END)
        )) AS score,
        'PENDING',
        CONCAT('Evaluated against report #', p_report_id)
    FROM found_reports fr
    WHERE fr.status = 'UNCLAIMED'
      AND fr.animal_type = v_type
      AND NOT EXISTS (
          SELECT 1 FROM potential_matches pm 
          WHERE pm.report_id = p_report_id AND pm.found_report_id = fr.found_report_id
      );
END //
DELIMITER ;

-- Procedure 2: ACID Transaction - Confirm recovery & close case
DROP PROCEDURE IF EXISTS sp_confirm_recovery;
DELIMITER //
CREATE PROCEDURE sp_confirm_recovery(
    IN p_match_id INT,
    IN p_confirmed_by INT,
    IN p_notes TEXT
)
BEGIN
    DECLARE v_report_id INT;
    DECLARE v_found_report_id INT;
    DECLARE v_owner_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction Rolled Back: Confirmation failed.';
    END;

    START TRANSACTION;

    SELECT report_id, found_report_id INTO v_report_id, v_found_report_id
    FROM potential_matches WHERE match_id = p_match_id FOR UPDATE;

    SELECT p.owner_id INTO v_owner_id
    FROM lost_reports lr JOIN pets p ON lr.pet_id = p.pet_id
    WHERE lr.report_id = v_report_id;

    -- Update match
    UPDATE potential_matches SET match_status = 'CONFIRMED' WHERE match_id = p_match_id;

    -- Insert recovery record
    INSERT INTO recovery_cases (match_id, report_id, confirmed_by, recovery_notes)
    VALUES (p_match_id, v_report_id, p_confirmed_by, p_notes);

    -- Update lost report status
    UPDATE lost_reports SET status = 'RESOLVED' WHERE report_id = v_report_id;

    -- Update found report status
    UPDATE found_reports SET status = 'MATCHED' WHERE found_report_id = v_found_report_id;

    -- Notify owner
    INSERT INTO notifications (user_id, notification_type, message)
    VALUES (v_owner_id, 'RECOVERY_CONFIRMED', CONCAT('Great news! Pet in report #', v_report_id, ' is officially recovered!'));

    -- Record audit log
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (p_confirmed_by, 'CONFIRM_RECOVERY', 'recovery_cases', p_match_id, JSON_OBJECT('report_id', v_report_id, 'status', 'RESOLVED'));

    COMMIT;
END //
DELIMITER ;

-- Procedure 3: Dashboard Statistics
DROP PROCEDURE IF EXISTS sp_get_dashboard_stats;
DELIMITER //
CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM lost_reports WHERE status = 'ACTIVE') AS active_lost_reports,
        (SELECT COUNT(*) FROM found_reports WHERE status = 'UNCLAIMED') AS unclaimed_found_pets,
        (SELECT COUNT(*) FROM potential_matches WHERE match_status = 'PENDING') AS pending_matches,
        (SELECT COUNT(*) FROM recovery_cases) AS total_recovered_pets,
        (SELECT COUNT(*) FROM shelters) AS active_shelters,
        (SELECT COUNT(*) FROM users WHERE role = 'OWNER') AS registered_owners,
        (SELECT ROUND(AVG(match_score), 2) FROM potential_matches) AS average_match_score;
END //
DELIMITER ;


-- =============================================================================
-- SECTION 8: TRIGGERS (INTEGRITY & AUTOMATION)
-- =============================================================================

-- Trigger 1: Validate lost_date is not in future
DROP TRIGGER IF EXISTS trg_before_lost_report_insert;
DELIMITER //
CREATE TRIGGER trg_before_lost_report_insert
BEFORE INSERT ON lost_reports
FOR EACH ROW
BEGIN
    IF NEW.lost_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Integrity Error: lost_date cannot be in the future.';
    END IF;
END //
DELIMITER ;

-- Trigger 2: Auto increment shelter count on intake
DROP TRIGGER IF EXISTS trg_after_shelter_intake;
DELIMITER //
CREATE TRIGGER trg_after_shelter_intake
AFTER INSERT ON shelter_intakes
FOR EACH ROW
BEGIN
    UPDATE shelters
    SET current_count = current_count + 1
    WHERE shelter_id = NEW.shelter_id;
END //
DELIMITER ;

-- Trigger 3: Audit pet modifications
DROP TRIGGER IF EXISTS trg_audit_pet_update;
DELIMITER //
CREATE TRIGGER trg_audit_pet_update
AFTER UPDATE ON pets
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        NEW.owner_id, 'UPDATE_PET', 'pets', NEW.pet_id,
        JSON_OBJECT('name', OLD.pet_name, 'chip', OLD.microchip_id),
        JSON_OBJECT('name', NEW.pet_name, 'chip', NEW.microchip_id)
    );
END //
DELIMITER ;


-- =============================================================================
-- SECTION 9: INDEXES & FULL-TEXT SEARCH
-- =============================================================================

CREATE INDEX idx_pets_type_breed ON pets(animal_type, breed);
CREATE INDEX idx_pets_chip ON pets(microchip_id);
CREATE INDEX idx_lost_status_date ON lost_reports(status, lost_date);
CREATE INDEX idx_matches_score ON potential_matches(match_score DESC);

CREATE FULLTEXT INDEX ft_lost_desc ON lost_reports(description);
CREATE FULLTEXT INDEX ft_found_desc ON found_reports(description);

-- Demonstration of Natural Language FULLTEXT search
SELECT report_id, description 
FROM lost_reports 
WHERE MATCH(description) AGAINST ('collar red' IN NATURAL LANGUAGE MODE);


-- =============================================================================
-- SECTION 10: TRANSACTIONS WITH SAVEPOINT AND ROLLBACK
-- =============================================================================

START TRANSACTION;
SAVEPOINT sp_before_test;

-- Test insert
INSERT INTO potential_matches (report_id, found_report_id, match_score, match_status)
VALUES (2, 2, 60.00, 'PENDING');

-- Rollback to savepoint demonstrating rollback logic
ROLLBACK TO SAVEPOINT sp_before_test;
COMMIT;

-- Verification
SELECT 'Database setup & verification complete!' AS status;
