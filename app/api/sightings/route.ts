import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/db';

const ZONE_COORDS: Record<string, [number, number]> = {
  Indiranagar: [77.6408, 12.9784],
  Koramangala: [77.6245, 12.9352],
  Whitefield: [77.7499, 12.9698],
  'HSR Layout': [77.6446, 12.9121],
  Jayanagar: [77.5938, 12.9250],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get('zone') || 'Indiranagar';
    const radius = Number(searchParams.get('radius')) || 5000;

    const coords = ZONE_COORDS[zone] || [77.6408, 12.9784];
    const db = await getMongoDb();

    // MongoDB 2dsphere $geoNear aggregation pipeline
    const sightings = await db.collection('sightings').aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: coords },
          distanceField: 'distance_meters',
          maxDistance: radius,
          spherical: true,
        },
      },
      {
        $project: {
          lost_report_id: 1,
          reporter_name: 1,
          address: 1,
          description: 1,
          confidence_level: 1,
          location: 1,
          timestamp: 1,
          distance_km: { $round: [{ $divide: ['$distance_meters', 1000] }, 2] },
        },
      },
      { $limit: 20 },
    ]).toArray();

    return NextResponse.json({ sightings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lost_report_id, address, description, confidence_level } = body;

    const db = await getMongoDb();
    const newSighting = {
      lost_report_id: Number(lost_report_id) || 1,
      reported_by_user_id: 1,
      reporter_name: 'Citizen Sighting',
      timestamp: new Date(),
      location: {
        type: 'Point',
        coordinates: [77.6408 + (Math.random() - 0.5) * 0.02, 12.9784 + (Math.random() - 0.5) * 0.02],
      },
      address: address || 'Indiranagar, Bengaluru',
      description: description || 'Observed stray animal',
      confidence_level: confidence_level || 'LIKELY',
      photo_urls: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1'],
    };

    const result = await db.collection('sightings').insertOne(newSighting);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}