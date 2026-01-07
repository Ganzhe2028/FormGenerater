import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const form = db.getForm(id);

  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 });
  }

  return NextResponse.json(form);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title } = body;

    const form = db.getForm(id);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    if (title) {
      form.title = title;
      db.saveForm(form); // Assumes saveForm upserts/overwrites
    }

    return NextResponse.json(form);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}
