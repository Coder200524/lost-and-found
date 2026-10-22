// REST Route Handler: /api/claims (FST Unit 3 & Unit 4)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const claimantId = searchParams.get('claimantId');
    const claimantEmail = searchParams.get('claimantEmail');
    const sapId = searchParams.get('sapId');
    const status = searchParams.get('status');
    const itemId = searchParams.get('itemId');

    const where: Record<string, unknown> = {};
    const orConditions: Array<Record<string, unknown>> = [];
    if (claimantId) orConditions.push({ claimantId });
    if (claimantEmail) {
      orConditions.push({ claimantEmail });
      const prefix = claimantEmail.split('@')[0];
      if (prefix && prefix !== claimantEmail) {
        orConditions.push({ claimantEmail: { contains: prefix } });
      }
    }
    if (sapId) {
      try {
        const u = await prisma.user.findFirst({ where: { sapId }, select: { id: true, email: true } });
        if (u) {
          orConditions.push({ claimantId: u.id });
          orConditions.push({ claimantEmail: u.email });
        }
      } catch (err) {
        console.warn('Could not map sapId to user:', err);
      }
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }
    if (status) where.status = status;
    if (itemId) where.itemId = itemId;

    const claims = await prisma.claim.findMany({
      where,
      include: {
        item: true,
        claimant: {
          select: { id: true, name: true, email: true, department: true, sapId: true },
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
    const {
      itemId,
      claimantId,
      claimantName,
      claimantEmail,
      rollNo,
      sapId,
      department,
      academicYear,
      proofDetails,
    } = body;

    // 1. Required fields
    if (!itemId || !claimantName || !claimantEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required claim fields (itemId, claimantName, claimantEmail)' },
        { status: 400 }
      );
    }

    const emailLower = (claimantEmail || '').trim().toLowerCase();
    if (!emailLower.endsWith('@svkmmumbai.onmicrosoft.com')) {
      return NextResponse.json(
        { success: false, error: 'Compulsory SVKM Email Suffix: Email must end with @svkmmumbai.onmicrosoft.com' },
        { status: 400 }
      );
    }

    // 2. Roll Number validation: ^[A-Za-z][0-9]{3}$
    const rollNoRegex = /^[A-Za-z][0-9]{3}$/;
    const formattedRoll = (rollNo || '').trim().toUpperCase();
    if (!formattedRoll || !rollNoRegex.test(formattedRoll)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Roll Number. Must be exactly 4 characters: 1 letter followed by 3 digits (e.g. A090, B007).',
        },
        { status: 400 }
      );
    }

    // 3. SAP ID validation: 11 or 12 numeric digits starting with 6: ^6[0-9]{10,11}$
    const sapIdRegex = /^6[0-9]{10,11}$/;
    const formattedSap = (sapId || '').toString().trim();
    if (!formattedSap || !sapIdRegex.test(formattedSap)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid SAP ID. Must be 11 or 12 numeric digits starting with 6 (e.g. 60017240146).',
        },
        { status: 400 }
      );
    }

    // 4. Proof of ownership validation
    const formattedProof = (proofDetails || '').trim();
    if (!formattedProof || formattedProof.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Substantive proof of ownership is required.' },
        { status: 400 }
      );
    }

    // 5. Item availability verification
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    if (item.status === 'CLAIMED' || item.status === 'RESOLVED') {
      return NextResponse.json(
        { success: false, error: 'This item has already been claimed and approved.' },
        { status: 400 }
      );
    }

    // 6. Resolve claimantId to an existing user in database to satisfy foreign key constraint
    let validClaimantId: string | null = null;
    if (claimantId) {
      const userById = await prisma.user.findUnique({ where: { id: claimantId } }).catch(() => null);
      if (userById) validClaimantId = userById.id;
    }
    if (!validClaimantId && claimantEmail) {
      const userByEmail = await prisma.user.findUnique({ where: { email: claimantEmail.trim() } }).catch(() => null);
      if (userByEmail) validClaimantId = userByEmail.id;
    }
    if (!validClaimantId && formattedSap) {
      const userBySap = await prisma.user.findFirst({ where: { sapId: formattedSap } }).catch(() => null);
      if (userBySap) validClaimantId = userBySap.id;
    }

    // 7. Prevent duplicate active claim by the same student for this item
    if (validClaimantId || claimantEmail) {
      const existingClaim = await prisma.claim.findFirst({
        where: {
          itemId,
          OR: [
            ...(validClaimantId ? [{ claimantId: validClaimantId }] : []),
            ...(claimantEmail ? [{ claimantEmail: claimantEmail.trim() }] : []),
          ],
          status: { in: ['PENDING', 'APPROVED'] },
        },
      });

      if (existingClaim) {
        return NextResponse.json(
          {
            success: false,
            error: 'You have already submitted an active verification claim for this item.',
          },
          { status: 409 }
        );
      }
    }

    // 8. Create claim with PENDING status.
    // Note: Item remains OPEN in active listings until a claim is APPROVED.
    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: validClaimantId,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim(),
        rollNo: formattedRoll,
        sapId: formattedSap,
        department: department || null,
        academicYear: academicYear || null,
        proofDetails: formattedProof,
        status: 'PENDING',
      },
    });

    // 8. Mongoose audit log
    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: 'CLAIM_SUBMITTED',
          entityType: 'CLAIM',
          entityId: claim.id,
          performedBy: claimantEmail,
          details: { itemId, claimantName, rollNo: formattedRoll, sapId: formattedSap },
        });
      }
    } catch {}

    return NextResponse.json(
      { success: true, message: 'Verification claim submitted successfully', data: claim },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating claim:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit claim' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { claimId, status, adminEmail } = body;

    if (!claimId || !status || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid claimId and status (APPROVED or REJECTED) are required.' },
        { status: 400 }
      );
    }

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: true },
    });

    if (!claim) {
      return NextResponse.json({ success: false, error: 'Claim record not found.' }, { status: 404 });
    }

    if (status === 'APPROVED') {
      // Prevent two competing claims from being approved
      const alreadyApproved = await prisma.claim.findFirst({
        where: { itemId: claim.itemId, id: { not: claimId }, status: 'APPROVED' },
      });
      if (alreadyApproved) {
        return NextResponse.json(
          { success: false, error: 'Another claim has already been approved for this item.' },
          { status: 409 }
        );
      }

      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'APPROVED' },
      });

      // Update item status to CLAIMED
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' },
      });

      // Reject other pending competing claims
      await prisma.claim.updateMany({
        where: { itemId: claim.itemId, id: { not: claimId }, status: 'PENDING' },
        data: { status: 'REJECTED' },
      });

      // Finder reward
      if (claim.item.userId) {
        await prisma.user.update({
          where: { id: claim.item.userId },
          data: { points: { increment: 50 }, badge: 'Campus Hero' },
        });
      }
    } else {
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'REJECTED' },
      });

      const otherApproved = await prisma.claim.findFirst({
        where: { itemId: claim.itemId, status: 'APPROVED' },
      });
      if (!otherApproved) {
        await prisma.item.update({
          where: { id: claim.itemId },
          data: { status: 'OPEN' },
        });
      }
    }

    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: status === 'APPROVED' ? 'CLAIM_APPROVED' : 'CLAIM_REJECTED',
          entityType: 'CLAIM',
          entityId: claim.id,
          performedBy: adminEmail || 'admin',
          details: { itemId: claim.itemId, claimantName: claim.claimantName },
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Claim successfully marked as ${status}.`,
    });
  } catch (error) {
    console.error('Error resolving claim via API:', error);
    return NextResponse.json({ success: false, error: 'Failed to update claim.' }, { status: 500 });
  }
}
