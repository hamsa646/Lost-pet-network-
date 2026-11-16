// =============================================================================
// PES UNIVERSITY - DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING
// DBMS EXPERIENTIAL LEARNING - LEVEL 3 PROJECT
// =============================================================================
// Project Title: Lost Pet Identification and Recovery Network
// Team Members:
//   1. Harshitha Vangaveti  (USN: PES2UG24AM064)
//   2. Hamsa M N            (USN: PES2UG24AM060)
// Faculty Guide: Dr. Nagasundari S
// =============================================================================
// Run with: mongosh "mongodb://localhost:27017" --file database/mongodb_setup.js
// =============================================================================

use('lost_pet_network_mongo');

print("=================================================================");
print("MongoDB Setup: Lost Pet Identification and Recovery Network");
print("=================================================================\n");

// 1. DROP EXISTING COLLECTIONS
['sightings', 'activity_logs', 'pet_descriptions', 'notifications_queue', 'match_history'].forEach(col => {
  try { db.getCollection(col).drop(); } catch (e) {}
});

// 2. CREATE COLLECTIONS WITH SCHEMA VALIDATION & INDEXES
print("Creating collections with validation and indexes...");

// SIGHTINGS: Stores crowdsourced citizen sightings with GeoJSON Point coordinates
db.createCollection("sightings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["lost_report_id", "reported_by_user_id", "timestamp", "location", "address", "confidence_level"],
      properties: {
        lost_report_id: { bsonType: "number", description: "References MySQL lost_reports.report_id" },
        reported_by_user_id: { bsonType: "number", description: "References MySQL users.user_id" },
        reporter_name: { bsonType: "string" },
        timestamp: { bsonType: "date" },
        location: {
          bsonType: "object",
          required: ["type", "coordinates"],
          properties: {
            type: { enum: ["Point"] },
            coordinates: { bsonType: "array", minItems: 2, maxItems: 2 } // [longitude, latitude]
          }
        },
        address: { bsonType: "string" },
        description: { bsonType: "string" },
        confidence_level: { enum: ["CERTAIN", "LIKELY", "UNSURE"] },
        photo_urls: { bsonType: "array" },
        is_verified: { bsonType: "bool" }
      }
    }
  }
});
db.sightings.createIndex({ location: "2dsphere" });
db.sightings.createIndex({ lost_report_id: 1, timestamp: -1 });

// PET_DESCRIPTIONS: Stores rich unstructured notes and keyword tags
db.createCollection("pet_descriptions");
db.pet_descriptions.createIndex({ raw_description: "text", keywords: "text" });
db.pet_descriptions.createIndex({ pet_id: 1 }, { unique: true });

// ACTIVITY_LOGS: Audit trail
db.createCollection("activity_logs");
db.activity_logs.createIndex({ timestamp: -1 });
db.activity_logs.createIndex({ user_id: 1 });

// NOTIFICATIONS_QUEUE
db.createCollection("notifications_queue");
db.notifications_queue.createIndex({ status: 1, scheduled_at: 1 });

// MATCH_HISTORY
db.createCollection("match_history");
db.match_history.createIndex({ match_id: 1 });

print("Collections created successfully.\n");


// 3. SEED REALISTIC BENGALURU SAMPLE DATA
print("Seeding sample documents...");

// Sightings with Bangalore GeoJSON coordinates [longitude, latitude]
db.sightings.insertMany([
  {
    lost_report_id: 1,
    reported_by_user_id: 7,
    reporter_name: "Suresh Pillai",
    timestamp: new Date("2026-11-06T09:30:00Z"),
    location: { type: "Point", coordinates: [77.6271, 12.9344] },
    address: "Near Sony World Signal, Koramangala 4th Block, Bengaluru",
    description: "Golden Retriever seen drinking water near tea stall. Had a faded red collar.",
    confidence_level: "CERTAIN",
    photo_urls: ["https://images.unsplash.com/photo-1552053831-71594a27632d"],
    is_verified: true,
    created_at: new Date()
  },
  {
    lost_report_id: 1,
    reported_by_user_id: 8,
    reporter_name: "Ananya Krishnan",
    timestamp: new Date("2026-11-07T16:15:00Z"),
    location: { type: "Point", coordinates: [77.6320, 12.9279] },
    address: "Opposite Bethany High School, Koramangala 6th Block, Bengaluru",
    description: "Friendly golden dog walking along footpath with slight limp in front paw.",
    confidence_level: "LIKELY",
    photo_urls: ["https://images.unsplash.com/photo-1537151608828-ea2b11777ee8"],
    is_verified: true,
    created_at: new Date()
  },
  {
    lost_report_id: 2,
    reported_by_user_id: 8,
    reporter_name: "Ananya Krishnan",
    timestamp: new Date("2026-11-09T08:20:00Z"),
    location: { type: "Point", coordinates: [77.6412, 12.9784] },
    address: "100 Feet Road, Indiranagar, Bengaluru",
    description: "Fluffy white Persian cat with blue eyes hiding behind bakery dumpster.",
    confidence_level: "CERTAIN",
    photo_urls: ["https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba"],
    is_verified: true,
    created_at: new Date()
  },
  {
    lost_report_id: 3,
    reported_by_user_id: 7,
    reporter_name: "Suresh Pillai",
    timestamp: new Date("2026-11-11T14:30:00Z"),
    location: { type: "Point", coordinates: [77.6350, 12.9121] },
    address: "27th Main Road, HSR Layout Sector 1, Bengaluru",
    description: "Tricolor Beagle roaming near park gate. Sniffing joggers and wagging tail.",
    confidence_level: "CERTAIN",
    photo_urls: ["https://images.unsplash.com/photo-1537151625747-768eb6cf92b2"],
    is_verified: true,
    created_at: new Date()
  },
  {
    lost_report_id: 4,
    reported_by_user_id: 8,
    reporter_name: "Ananya Krishnan",
    timestamp: new Date("2026-11-04T17:45:00Z"),
    location: { type: "Point", coordinates: [77.5855, 12.9299] },
    address: "Jayanagar 4th Block Shopping Complex, Bengaluru",
    description: "Large black and tan German Shepherd resting outside closed store.",
    confidence_level: "CERTAIN",
    photo_urls: ["https://images.unsplash.com/photo-1589941013453-ec89f33b5455"],
    is_verified: true,
    created_at: new Date()
  }
]);

// Pet Descriptions with Keywords
db.pet_descriptions.insertMany([
  {
    pet_id: 1,
    pet_name: "Buddy",
    raw_description: "Friendly golden retriever with caramel coat, white patch on chest, answers to Buddy, food motivated.",
    keywords: ["golden", "retriever", "caramel", "white patch", "friendly", "food motivated"],
    color_tags: ["golden", "caramel", "white"],
    size_estimate: "LARGE",
    last_known_collar: "Faded red nylon collar with brass bell",
    updated_at: new Date()
  },
  {
    pet_id: 3,
    pet_name: "Snowy",
    raw_description: "Long-haired pure white Persian cat. Deep blue eyes. Very timid, hides in tight dark corners.",
    keywords: ["persian", "white cat", "blue eyes", "fluffy", "timid"],
    color_tags: ["white"],
    size_estimate: "MEDIUM",
    last_known_collar: "Pink velvet breakaway collar",
    updated_at: new Date()
  },
  {
    pet_id: 5,
    pet_name: "Bella",
    raw_description: "Small tricolor Beagle with distinctive white tail tip (beagle flag), floppy brown ears, black saddle.",
    keywords: ["beagle", "tricolor", "floppy ears", "white tail tip"],
    color_tags: ["white", "black", "brown"],
    size_estimate: "MEDIUM",
    last_known_collar: "Blue reflective collar with QR tag",
    updated_at: new Date()
  }
]);

// Activity Logs
db.activity_logs.insertMany([
  { user_id: 1, user_email: "harshitha.v@lostpetnetwork.in", action: "ADMIN_LOGIN", timestamp: new Date() },
  { user_id: 3, user_email: "rajesh.kumar@gmail.com", action: "CREATE_LOST_REPORT", details: { report_id: 1 }, timestamp: new Date() },
  { user_id: 2, user_email: "hamsa.mn@lostpetnetwork.in", action: "VERIFY_SIGHTING", details: { sighting_id: 1 }, timestamp: new Date() },
  { user_id: 1, user_email: "harshitha.v@lostpetnetwork.in", action: "CONFIRM_RECOVERY", details: { match_id: 1 }, timestamp: new Date() }
]);

print("Sample data seeded successfully.\n");


// 4. DEMONSTRATE ADVANCED AGGREGATION PIPELINES
print("--- Aggregation Pipeline 1: Sightings Count & Summary per Lost Report ---");
const agg1 = db.sightings.aggregate([
  {
    $group: {
      _id: "$lost_report_id",
      total_sightings: { $sum: 1 },
      verified_count: { $sum: { $cond: ["$is_verified", 1, 0] } },
      latest_sighting: { $max: "$timestamp" }
    }
  },
  { $sort: { total_sightings: -1 } }
]).toArray();
printjson(agg1);

print("\n--- Aggregation Pipeline 2: Geospatial $geoNear Proximity Search ---");
// Finds sightings within 5km of Koramangala [77.6271, 12.9344]
const agg2 = db.sightings.aggregate([
  {
    $geoNear: {
      near: { type: "Point", coordinates: [77.6271, 12.9344] },
      distanceField: "distance_meters",
      maxDistance: 5000,
      spherical: true
    }
  },
  {
    $project: {
      address: 1,
      confidence_level: 1,
      distance_km: { $round: [{ $divide: ["$distance_meters", 1000] }, 2] }
    }
  }
]).toArray();
printjson(agg2);

print("\n--- Text Search: Querying Pet Descriptions using $text index ---");
const textResults = db.pet_descriptions.find(
  { $text: { $search: "golden collar friendly" } },
  { score: { $meta: "textScore" }, pet_name: 1, raw_description: 1 }
).sort({ score: { $meta: "textScore" } }).toArray();
printjson(textResults);

print("\n=================================================================");
print("MongoDB initialization complete!");
print("=================================================================");
