import { NextResponse } from 'next/server';
import { getFilterOptions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const filters = await getFilterOptions();
    return NextResponse.json(filters);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
