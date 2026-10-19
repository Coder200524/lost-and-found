// Report Misuse API Route Handler (SVKM Mindmap: Privacy & Security - Report Misuse / Fake Claims)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const item = await prisma.item.update({
      where: { id },
      data: {
        reportsCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item reported for administrative review. Thank you for keeping SVKM safe.',
      reportsCount: item.reportsCount,
    });
  } catch (error) {
    console.error('Error reporting item:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit report' }, { status: 500 });
  }
}
