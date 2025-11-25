import { NextResponse } from 'next/server';
import { getCaseSummaries } from '@lib/caseSummary';

export async function GET() {
  try {
    const cases = await getCaseSummaries();
    return NextResponse.json({ cases });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}
