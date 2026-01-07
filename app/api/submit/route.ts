import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { formId, data } = await req.json();
    
    if (!formId || !data) {
       return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const submission = {
      id: crypto.randomUUID(),
      formId,
      data,
      submittedAt: new Date().toISOString(),
    };

    db.addSubmission(submission);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
  }
}
