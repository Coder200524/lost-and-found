// REST Route Handler: /api/claims (FST Unit 3 & Unit 4)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

export async function GET() {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        item: true,
        claimant: {
          select: { id: true, name: true, email: true, department: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: claims });
  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, claimantId, claimantName, claimantEmail, proofDetails } = body;

    if (!itemId || !claimantName || !claimantEmail || !proofDetails) {
      return NextResponse.json({ success: false, error: 'Missing required claim fields' }, { status: 400 });
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: claimantId || null,
        claimantName,
        claimantEmail,
        proofDetails,
        status: 'PENDING',
      },
    });

    // Update item status to CLAIMED
    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'CLAIMED' },
    });

    // Mongoose audit log
    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: 'CLAIM_SUBMITTED',
          entityType: 'CLAIM',
          entityId: claim.id,
          performedBy: claimantEmail,
          details: { itemId, claimantName },
        });
      }
    } catch {}

    return NextResponse.json({ success: true, message: 'Claim submitted successfully', data: claim }, { status: 201 });
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit claim' }, { status: 500 });
  }
}
