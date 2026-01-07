import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const form = await req.json();
    db.saveForm(form);
    return NextResponse.json({ success: true, form });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}
