// Statistics API for Admin & Dashboard (FST Unit 3)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalItems = await prisma.item.count();
    const lostCount = await prisma.item.count({ where: { type: 'LOST' } });
    const foundCount = await prisma.item.count({ where: { type: 'FOUND' } });
    const openCount = await prisma.item.count({ where: { status: 'OPEN' } });
    const claimedCount = await prisma.item.count({ where: { status: 'CLAIMED' } });
    const resolvedCount = await prisma.item.count({ where: { status: 'RESOLVED' } });
    const totalClaims = await prisma.claim.count();
    const totalUsers = await prisma.user.count();

    // Group by categories
    const categories = await prisma.item.groupBy({
      by: ['category'],
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalItems,
        lostCount,
        foundCount,
        openCount,
        claimedCount,
        resolvedCount,
        recoveryRate: totalItems > 0 ? Math.round(((claimedCount + resolvedCount) / totalItems) * 100) : 0,
        totalClaims,
        totalUsers,
        categories: categories.map((c) => ({
          category: c.category,
          count: c._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
