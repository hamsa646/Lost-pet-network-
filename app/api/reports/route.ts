import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'LOST';

    if (type === 'LOST') {
      const reports: any = await query(`
        SELECT lr.report_id, lr.pet_id, p.name AS pet_name, p.species, p.breed, p.color,
               lr.last_seen_date, lr.last_seen_address, lr.bengaluru_zone, lr.reward_amount, lr.status
        FROM lost_reports lr
        JOIN pets p ON lr.pet_id = p.pet_id
        ORDER BY lr.report_id DESC
      `);
      return NextResponse.json({ reports });
    } else {
      const reports: any = await query(`
        SELECT fr.report_id, fr.species, fr.breed, fr.color, fr.found_date, fr.found_address, fr.custody_status, s.name AS shelter_name
        FROM found_reports fr
        LEFT JOIN shelters s ON fr.shelter_id = s.shelter_id
        ORDER BY fr.report_id DESC
      `);
      return NextResponse.json({ reports });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, pet_id, species, breed, color, address, zone, reward_amount, lat, lng } = body;

    if (type === 'LOST') {
      const result: any = await query(
        `INSERT INTO lost_reports (pet_id, reported_by, last_seen_date, last_seen_lat, last_seen_lng, last_seen_address, bengaluru_zone, reward_amount, status)
         VALUES (?, 1, NOW(), ?, ?, ?, ?, ?, 'OPEN')`,
        [pet_id, lat || 12.9784, lng || 77.6408, address, zone || 'Indiranagar', reward_amount || 0]
      );
      return NextResponse.json({ success: true, report_id: result.insertId });
    } else {
      const result: any = await query(
        `INSERT INTO found_reports (finder_id, species, breed, color, found_date, found_lat, found_lng, found_address, custody_status)
         VALUES (1, ?, ?, ?, NOW(), ?, ?, ?, 'WITH_FINDER')`,
        [species || 'DOG', breed || 'Unknown', color || 'Brown', lat || 12.9784, lng || 77.6408, address]
      );
      return NextResponse.json({ success: true, report_id: result.insertId });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}