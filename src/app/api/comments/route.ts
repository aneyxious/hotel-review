import { NextRequest, NextResponse } from 'next/server';
import { getComments } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);
    const scoreMin = searchParams.get('scoreMin') ? parseFloat(searchParams.get('scoreMin')!) : undefined;
    const scoreMax = searchParams.get('scoreMax') ? parseFloat(searchParams.get('scoreMax')!) : undefined;
    const star = searchParams.get('star') ? parseInt(searchParams.get('star')!, 10) : undefined;
    const roomType = searchParams.get('roomType') || undefined;
    const travelType = searchParams.get('travelType') || undefined;
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await getComments(page, pageSize, {
      scoreMin,
      scoreMax,
      star,
      roomType,
      travelType,
      category,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
