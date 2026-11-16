import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const pets: any = await query(`
      SELECT p.pet_id, p.owner_id, p.name, p.species, p.breed, p.color, p.distinctive_features, p.microchip_id, p.status,
             CONCAT(u.first_name, ' ', u.last_name) AS owner_name
      FROM pets p
      JOIN users u ON p.owner_id = u.user_id
      ORDER BY p.pet_id DESC
    `);
    return NextResponse.json({ pets });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, species, breed, color, distinctive_features, microchip_id, owner_id } = body;

    const result: any = await query(
      `INSERT INTO pets (owner_id, name, species, breed, color, distinctive_features, microchip_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'HOME')`,
      [owner_id || 1, name, species, breed, color, distinctive_features || null, microchip_id || null]
    );

    return NextResponse.json({ success: true, pet_id: result.insertId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}