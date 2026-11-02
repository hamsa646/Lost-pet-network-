CREATE DATABASE lost_pet_network;
USE lost_pet_network;


CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('OWNER', 'COMMUNITY', 'ADMIN') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Pets (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_id INT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    colour VARCHAR(50),
    gender ENUM('MALE', 'FEMALE', 'UNKNOWN'),
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pets_owner
        FOREIGN KEY (owner_id) REFERENCES Users(user_id),

    CONSTRAINT chk_pet_age
        CHECK (age IS NULL OR age >= 0)
);


CREATE TABLE Lost_Reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    reported_by INT NOT NULL,
    last_seen_location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    lost_datetime DATETIME NOT NULL,
    description TEXT,
    status ENUM(
        'LOST',
        'UNDER_INVESTIGATION',
        'RECOVERED',
        'CLOSED'
    ) NOT NULL DEFAULT 'LOST',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_report_pet
        FOREIGN KEY (pet_id) REFERENCES Pets(pet_id),

    CONSTRAINT fk_report_user
        FOREIGN KEY (reported_by) REFERENCES Users(user_id),

    CONSTRAINT chk_report_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_report_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);


CREATE TABLE Sightings (
    sighting_id INT AUTO_INCREMENT PRIMARY KEY,
    reported_by INT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    sighting_datetime DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sighting_user
        FOREIGN KEY (reported_by) REFERENCES Users(user_id),

    CONSTRAINT chk_sighting_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_sighting_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);


CREATE TABLE Potential_Matches (
    match_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    sighting_id INT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    match_status ENUM(
        'PENDING',
        'ACCEPTED',
        'REJECTED',
        'VERIFIED'
    ) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_match_report
        FOREIGN KEY (report_id) REFERENCES Lost_Reports(report_id),

    CONSTRAINT fk_match_sighting
        FOREIGN KEY (sighting_id) REFERENCES Sightings(sighting_id),

    CONSTRAINT uq_report_sighting
        UNIQUE (report_id, sighting_id),

    CONSTRAINT chk_match_score
        CHECK (match_score BETWEEN 0 AND 100)
);


CREATE TABLE Recovery_Cases (
    recovery_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL UNIQUE,
    match_id INT NOT NULL UNIQUE,
    verified_by INT NOT NULL,
    recovered_at DATETIME NOT NULL,
    recovery_notes TEXT,

    CONSTRAINT fk_recovery_report
        FOREIGN KEY (report_id) REFERENCES Lost_Reports(report_id),

    CONSTRAINT fk_recovery_match
        FOREIGN KEY (match_id) REFERENCES Potential_Matches(match_id),

    CONSTRAINT fk_recovery_verifier
        FOREIGN KEY (verified_by) REFERENCES Users(user_id)
);


CREATE TABLE Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
);


INSERT INTO Users
(user_id, full_name, email, password_hash, phone, role)
VALUES
(1, 'Ananya Rao', 'ananya@example.com', 'demo_hash_1', '9876500001', 'OWNER'),
(2, 'Rahul Kumar', 'rahul@example.com', 'demo_hash_2', '9876500002', 'COMMUNITY'),
(3, 'Meera Shah', 'meera@example.com', 'demo_hash_3', '9876500003', 'ADMIN'),
(4, 'Arjun Nair', 'arjun@example.com', 'demo_hash_4', '9876500004', 'OWNER'),
(5, 'Priya Sharma', 'priya@example.com', 'demo_hash_5', '9876500005', 'OWNER'),
(6, 'Kiran Reddy', 'kiran@example.com', 'demo_hash_6', '9876500006', 'COMMUNITY'),
(7, 'Sneha Iyer', 'sneha@example.com', 'demo_hash_7', '9876500007', 'OWNER'),
(8, 'Vikram Singh', 'vikram@example.com', 'demo_hash_8', '9876500008', 'COMMUNITY'),
(9, 'Divya Menon', 'divya@example.com', 'demo_hash_9', '9876500009', 'OWNER'),
(10, 'Rohan Das', 'rohan@example.com', 'demo_hash_10', '9876500010', 'OWNER'),
(11, 'Pooja Verma', 'pooja@example.com', 'demo_hash_11', '9876500011', 'COMMUNITY'),
(12, 'Aditya Joshi', 'aditya@example.com', 'demo_hash_12', '9876500012', 'OWNER'),
(13, 'Nisha Patel', 'nisha@example.com', 'demo_hash_13', '9876500013', 'COMMUNITY'),
(14, 'Sanjay Rao', 'sanjay@example.com', 'demo_hash_14', '9876500014', 'OWNER'),
(15, 'Kavya Krishnan', 'kavya@example.com', 'demo_hash_15', '9876500015', 'ADMIN');


INSERT INTO Pets
(pet_id, owner_id, pet_name, animal_type, breed, colour, gender, age)
VALUES
(1, 1, 'Bruno', 'Dog', 'Labrador', 'Brown', 'MALE', 3),
(2, 4, 'Milo', 'Cat', 'Persian', 'White', 'MALE', 2),
(3, 5, 'Coco', 'Dog', 'Pomeranian', 'Cream', 'FEMALE', 4),
(4, 7, 'Luna', 'Cat', 'Siamese', 'Grey', 'FEMALE', 2),
(5, 9, 'Rocky', 'Dog', 'German Shepherd', 'Black', 'MALE', 5),
(6, 10, 'Daisy', 'Rabbit', 'Dutch Rabbit', 'White', 'FEMALE', 1),
(7, 12, 'Charlie', 'Dog', 'Beagle', 'Tricolour', 'MALE', 3),
(8, 14, 'Bella', 'Cat', 'Indie', 'Orange', 'FEMALE', 2),
(9, 1, 'Max', 'Dog', 'Golden Retriever', 'Golden', 'MALE', 4),
(10, 4, 'Oreo', 'Cat', 'Persian', 'Black and White', 'MALE', 1),
(11, 5, 'Simba', 'Dog', 'Indie', 'Tan', 'MALE', 2),
(12, 7, 'Misty', 'Cat', 'Maine Coon', 'Grey', 'FEMALE', 3),
(13, 9, 'Buddy', 'Dog', 'Pug', 'Fawn', 'MALE', 5),
(14, 10, 'Kiwi', 'Bird', 'Parakeet', 'Green', 'UNKNOWN', 1),
(15, 12, 'Pepper', 'Dog', 'Dachshund', 'Black', 'FEMALE', 2);


INSERT INTO Lost_Reports
(report_id, pet_id, reported_by, last_seen_location,
 latitude, longitude, lost_datetime, description, status)
VALUES
(1, 1, 1, 'Indiranagar, Bengaluru', 12.9784000, 77.6408000, '2026-10-15 17:00:00', 'Brown Labrador wearing a red collar', 'RECOVERED'),
(2, 2, 4, 'Koramangala, Bengaluru', 12.9352000, 77.6245000, '2026-10-16 09:30:00', 'White Persian cat with blue eyes', 'RECOVERED'),
(3, 3, 5, 'Jayanagar, Bengaluru', 12.9250000, 77.5838000, '2026-10-17 14:00:00', 'Small cream dog with a pink collar', 'RECOVERED'),
(4, 4, 7, 'Whitefield, Bengaluru', 12.9698000, 77.7500000, '2026-10-18 18:15:00', 'Grey Siamese cat with a long tail', 'RECOVERED'),
(5, 5, 9, 'HSR Layout, Bengaluru', 12.9116000, 77.6389000, '2026-10-19 11:00:00', 'Black German Shepherd wearing a blue tag', 'RECOVERED'),
(6, 6, 10, 'Malleshwaram, Bengaluru', 13.0035000, 77.5643000, '2026-10-20 16:30:00', 'White rabbit with floppy ears', 'RECOVERED'),
(7, 7, 12, 'BTM Layout, Bengaluru', 12.9166000, 77.6101000, '2026-10-21 08:45:00', 'Tricolour Beagle with a brown leash', 'RECOVERED'),
(8, 8, 14, 'Rajajinagar, Bengaluru', 13.0108000, 77.5550000, '2026-10-22 12:00:00', 'Orange cat with a white chest', 'RECOVERED'),
(9, 9, 1, 'Marathahalli, Bengaluru', 12.9591000, 77.6974000, '2026-10-23 19:00:00', 'Golden Retriever with a red harness', 'RECOVERED'),
(10, 10, 4, 'Banashankari, Bengaluru', 12.9255000, 77.5468000, '2026-10-24 10:15:00', 'Black and white Persian cat', 'RECOVERED'),
(11, 11, 5, 'Electronic City, Bengaluru', 12.8399000, 77.6770000, '2026-10-25 15:00:00', 'Tan indie dog with a green collar', 'RECOVERED'),
(12, 12, 7, 'Yelahanka, Bengaluru', 13.1007000, 77.5963000, '2026-10-26 07:30:00', 'Grey Maine Coon cat with long fur', 'RECOVERED'),
(13, 13, 9, 'Basavanagudi, Bengaluru', 12.9416000, 77.5681000, '2026-10-27 17:45:00', 'Fawn pug with a black face', 'RECOVERED'),
(14, 14, 10, 'Hebbal, Bengaluru', 13.0358000, 77.5970000, '2026-10-28 13:00:00', 'Green parakeet with a yellow head', 'RECOVERED'),
(15, 15, 12, 'Bellandur, Bengaluru', 12.9304000, 77.6784000, '2026-10-29 18:30:00', 'Small black dachshund wearing a yellow collar', 'RECOVERED');


INSERT INTO Sightings
(sighting_id, reported_by, location, latitude,
 longitude, sighting_datetime)
VALUES
(1, 2, 'Near Indiranagar bus stop', 12.9790000, 77.6410000, '2026-10-15 18:00:00'),
(2, 6, 'Koramangala park entrance', 12.9360000, 77.6250000, '2026-10-16 11:00:00'),
(3, 8, 'Jayanagar 4th Block', 12.9255000, 77.5840000, '2026-10-17 15:30:00'),
(4, 11, 'Whitefield main road', 12.9700000, 77.7510000, '2026-10-18 19:00:00'),
(5, 13, 'HSR Layout sector 2', 12.9120000, 77.6390000, '2026-10-19 12:00:00'),
(6, 2, 'Malleshwaram market', 13.0040000, 77.5650000, '2026-10-20 17:00:00'),
(7, 6, 'BTM Layout lake road', 12.9170000, 77.6110000, '2026-10-21 09:30:00'),
(8, 8, 'Rajajinagar metro station', 13.0110000, 77.5560000, '2026-10-22 13:00:00'),
(9, 11, 'Marathahalli bridge', 12.9600000, 77.6980000, '2026-10-23 20:00:00'),
(10, 13, 'Banashankari bus stand', 12.9260000, 77.5470000, '2026-10-24 11:00:00'),
(11, 2, 'Electronic City phase 1', 12.8400000, 77.6780000, '2026-10-25 16:00:00'),
(12, 6, 'Yelahanka new town park', 13.1010000, 77.5970000, '2026-10-26 08:30:00'),
(13, 8, 'Basavanagudi main road', 12.9420000, 77.5690000, '2026-10-27 18:00:00'),
(14, 11, 'Hebbal flyover service road', 13.0360000, 77.5980000, '2026-10-28 14:00:00'),
(15, 13, 'Bellandur lake road', 12.9310000, 77.6790000, '2026-10-29 19:00:00');


INSERT INTO Potential_Matches
(match_id, report_id, sighting_id, match_score, match_status)
VALUES
(1, 1, 1, 95.00, 'VERIFIED'),
(2, 2, 2, 92.00, 'VERIFIED'),
(3, 3, 3, 90.00, 'VERIFIED'),
(4, 4, 4, 88.00, 'VERIFIED'),
(5, 5, 5, 96.00, 'VERIFIED'),
(6, 6, 6, 91.00, 'VERIFIED'),
(7, 7, 7, 89.00, 'VERIFIED'),
(8, 8, 8, 93.00, 'VERIFIED'),
(9, 9, 9, 97.00, 'VERIFIED'),
(10, 10, 10, 90.00, 'VERIFIED'),
(11, 11, 11, 94.00, 'VERIFIED'),
(12, 12, 12, 87.00, 'VERIFIED'),
(13, 13, 13, 92.00, 'VERIFIED'),
(14, 14, 14, 85.00, 'VERIFIED'),
(15, 15, 15, 91.00, 'VERIFIED');


INSERT INTO Recovery_Cases
(recovery_id, report_id, match_id, verified_by,
 recovered_at, recovery_notes)
VALUES
(1, 1, 1, 3, '2026-10-16 10:00:00', 'Owner confirmed Bruno using collar and photographs.'),
(2, 2, 2, 3, '2026-10-17 12:00:00', 'Milo safely returned to the owner.'),
(3, 3, 3, 3, '2026-10-18 16:00:00', 'Coco identified and reunited with the owner.'),
(4, 4, 4, 15, '2026-10-19 10:00:00', 'Luna recovered after owner verification.'),
(5, 5, 5, 3, '2026-10-20 14:00:00', 'Rocky confirmed by owner using identification details.'),
(6, 6, 6, 15, '2026-10-21 18:00:00', 'Daisy safely returned home.'),
(7, 7, 7, 3, '2026-10-22 11:00:00', 'Charlie reunited with the owner.'),
(8, 8, 8, 15, '2026-10-23 15:00:00', 'Bella identified using colour and photographs.'),
(9, 9, 9, 3, '2026-10-24 17:00:00', 'Max recovered and handed to the owner.'),
(10, 10, 10, 15, '2026-10-25 12:00:00', 'Oreo returned after identity confirmation.'),
(11, 11, 11, 3, '2026-10-26 16:00:00', 'Simba safely reunited with the owner.'),
(12, 12, 12, 15, '2026-10-27 10:00:00', 'Misty recovered and owner notified.'),
(13, 13, 13, 3, '2026-10-28 14:00:00', 'Buddy returned after match verification.'),
(14, 14, 14, 15, '2026-10-29 11:00:00', 'Kiwi returned to the owner after identification.'),
(15, 15, 15, 3, '2026-10-30 16:00:00', 'Pepper safely reunited with the owner.');


INSERT INTO Notifications (notification_id, user_id, message, is_read)
VALUES
(1, 1, 'A potential sighting was identified for Bruno.', TRUE),
(2, 2, 'Thank you for submitting a community sighting.', TRUE),
(3, 3, 'A recovery case requires administrative review.', TRUE),
(4, 4, 'A potential match was found for Milo.', TRUE),
(5, 5, 'Your pet Coco has a verified sighting.', TRUE),
(6, 6, 'Your sighting report has been recorded.', TRUE),
(7, 7, 'Luna has a potential match.', TRUE),
(8, 8, 'Thank you for helping locate a lost pet.', TRUE),
(9, 9, 'Rocky has been marked as recovered.', TRUE),
(10, 10, 'A sighting has been matched with Daisy.', TRUE),
(11, 11, 'Your community contribution was received.', TRUE),
(12, 12, 'Charlie has a verified potential match.', TRUE),
(13, 13, 'Your sighting report helped a pet owner.', TRUE),
(14, 14, 'Bella has been marked as recovered.', TRUE),
(15, 15, 'Recovery case review completed.', TRUE);
