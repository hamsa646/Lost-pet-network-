import mysql from 'mysql2/promise';
import { MongoClient, Db } from 'mongodb';

// -----------------------------------------------------------------------------
// MySQL Connection Pool (ACID Relational Core)
// -----------------------------------------------------------------------------
const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'lost_pet_network',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await mysqlPool.execute(sql, params);
  return rows as T;
}

// -----------------------------------------------------------------------------
// MongoDB Connection Client (NoSQL Crowdsourced Geospatial Sightings)
// -----------------------------------------------------------------------------
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB_NAME || 'lost_pet_network_mongo';
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

export async function getMongoDb(): Promise<Db> {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    mongoDb = mongoClient.db(mongoDbName);
  }
  return mongoDb!;
}

export { mysqlPool };