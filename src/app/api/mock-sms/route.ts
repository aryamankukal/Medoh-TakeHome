import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone, smsText } = await req.json();
  // Mock: Print SMS to terminal
  // eslint-disable-next-line no-console
  console.log(`\n--- MOCK SMS ---\nTo: ${phone}\nMessage: ${smsText}\n----------------\n`);
  return NextResponse.json({ success: true });
} 