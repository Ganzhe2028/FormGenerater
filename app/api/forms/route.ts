import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const forms = db.getForms();
    return NextResponse.json(forms);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.json();
    
    // Ensure createdAt is valid (not 0 or missing)
    if (!form.createdAt || form.createdAt < 1000000) {
      form.createdAt = Date.now();
    }
    
    db.saveForm(form);
    return NextResponse.json({ success: true, form });
  } catch {
    return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
  }
}
