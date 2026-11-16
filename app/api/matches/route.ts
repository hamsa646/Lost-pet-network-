import { NextResponse } from 'next/server';
import { query, mysqlPool } from '@/lib/db';

export async function GET() {
  try {
    const matches: any = await query(`
      SELECT 
        pm.match_id,
        pm.lost_report_id,
        pm.found_report_id,
        pm.match_score,
        pm.status,
        p.name AS lost_pet_name,
        p.species,
        p.breed,
        lr.last_seen_address,
        fr.species AS found_species,
        fr.breed AS found_breed,
        fr.color AS found_color,
        fr.found_address
      FROM potential_matches pm
      JOIN lost_reports lr ON pm.lost_report_id = lr.report_id
      JOIN pets p ON lr.pet_id = p.pet_id
      JOIN found_reports fr ON pm.found_report_id = fr.report_id
      ORDER BY pm.match_score DESC
    `);
    return NextResponse.json({ matches });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const connection = await mysqlPool.getConnection();
  try {
    const body = await req.json();
    const { match_id } = body;

    // Call Stored Procedure sp_confirm_recovery inside an ACID transaction
    await connection.beginTransaction();

    await connection.query('CALL sp_confirm_recovery(?, 1, @p_success)', [match_id]);
    const [result]: any = await connection.query('SELECT @p_success AS success');

    await connection.commit();

    return NextResponse.json({ success: Boolean(result?.[0]?.success) });
  } catch (e: any) {
    await connection.rollback();
    return NextResponse.json({ error: e.message || 'Transaction rolled back' }, { status: 500 });
  } finally {
    connection.release();
  }
}