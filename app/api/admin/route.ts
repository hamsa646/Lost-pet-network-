import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const auditLogs: any = await query('SELECT * FROM pet_audit_log ORDER BY changed_at DESC LIMIT 20');
    const shelterCapacity: any = await query('SELECT * FROM vw_shelter_capacity');
    const users: any = await query('SELECT user_id, email, first_name, last_name, role, city FROM users');

    return NextResponse.json({ auditLogs, shelterCapacity, users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}