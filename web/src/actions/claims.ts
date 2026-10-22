'use server';

// Server Actions for Claims (FST Unit 3 & Unit 4)
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

// Helper to record audit log safely
async function recordAudit(
  action: string,
  entityType: 'ITEM' | 'CLAIM' | 'USER',
  entityId: string,
  performedBy: string,
  role: string,
  details: Record<string, unknown>
) {
  try {
    const conn = await connectMongoose();
    if (conn) {
      await AuditLog.create({
        action,
        entityType,
        entityId,
        performedBy,
        role,
        details,
      });
    }
  } catch (err) {
    console.warn('AuditLog record failed (non-blocking):', err);
  }
}

export async function submitClaimAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'You must be logged in to claim an item.' };
    }

    const itemId = formData.get('itemId') as string;
    const claimantName = (formData.get('claimantName') as string)?.trim() || user.name || '';
    const claimantEmail = (formData.get('claimantEmail') as string)?.trim() || user.email || '';
    const rollNo = (formData.get('rollNo') as string)?.trim().toUpperCase() || '';
    const sapId = (formData.get('sapId') as string)?.trim() || '';
    const department = (formData.get('department') as string)?.trim() || '';
    const academicYear = (formData.get('academicYear') as string)?.trim() || '';
    const proofDetails = (formData.get('proofDetails') as string)?.trim() || '';

    // 1. Basic Required Fields
    if (!itemId) {
      return { success: false, error: 'Missing item identifier.' };
    }
    if (!claimantName || !claimantEmail) {
      return { success: false, error: 'Student name and email are required.' };
    }
    if (!claimantEmail.toLowerCase().endsWith('@svkmmumbai.onmicrosoft.com')) {
      return {
        success: false,
        error: 'Compulsory SVKM Email Suffix: Email must end with @svkmmumbai.onmicrosoft.com',
      };
    }

    // 2. Roll Number Validation: exactly 4 chars, first letter, 3 digits: ^[A-Za-z][0-9]{3}$
    const rollNoRegex = /^[A-Za-z][0-9]{3}$/;
    if (!rollNo || !rollNoRegex.test(rollNo)) {
      return {
        success: false,
        error: 'Invalid Roll Number. Must be exactly 4 characters: 1 letter followed by 3 digits (e.g. A090, B007).',
      };
    }

    // 3. SAP ID Validation: 11 or 12 numeric digits, starts with 6: ^6[0-9]{10,11}$
    const sapIdRegex = /^6[0-9]{10,11}$/;
    if (!sapId || !sapIdRegex.test(sapId)) {
      return {
        success: false,
        error: 'Invalid SAP ID. Must be 11 or 12 numeric digits starting with 6 (e.g. 60017240146).',
      };
    }

    // 4. Proof of Ownership Validation: non-empty
    if (!proofDetails || proofDetails.length < 5) {
      return {
        success: false,
        error: 'Substantive proof of ownership is required (e.g. serial number, distinctive marks, lock screen wallpaper, ID card number).',
      };
    }

    // 5. Item Availability Verification
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return { success: false, error: 'Item report not found.' };
    }
    if (item.status === 'CLAIMED' || item.status === 'RESOLVED') {
      return { success: false, error: 'This item has already been claimed and approved.' };
    }
    if (item.status === 'CLOSED') {
      return { success: false, error: 'This item listing is closed.' };
    }

    // 6. Prevent Duplicate Active Claims by the same student for the same item
    const existingClaim = await prisma.claim.findFirst({
      where: {
        itemId,
        claimantId: user.id,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (existingClaim) {
      return {
        success: false,
        error: 'You have already submitted an active verification claim for this item. Check your Profile page for updates.',
      };
    }

    // 7. Create Claim with PENDING status
    // Note: The item remains OPEN in active listings until a claim is APPROVED!
    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: user.id,
        claimantName,
        claimantEmail,
        rollNo,
        sapId,
        department: department || user.department || null,
        academicYear: academicYear || null,
        proofDetails,
        status: 'PENDING',
      },
    });

    // 8. Audit Logging
    await recordAudit(
      'CLAIM_SUBMITTED',
      'CLAIM',
      claim.id,
      claimantEmail,
      user.role,
      { itemId, claimantName, rollNo, sapId, itemTitle: item.title }
    );

    revalidatePath(`/items/${itemId}`);
    revalidatePath('/browse');
    revalidatePath('/admin');
    revalidatePath('/profile');

    return {
      success: true,
      claim,
      message: 'Verification claim submitted! Our campus administration and finder will review your ownership proof.',
    };
  } catch (error) {
    console.error('Error in submitClaimAction:', error);
    return { success: false, error: 'Failed to submit claim. Please try again.' };
  }
}

export async function resolveClaimAction(claimId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only campus administrators can verify claims.' };
    }

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { item: true },
    });

    if (!claim) {
      return { success: false, error: 'Claim record not found.' };
    }

    if (status === 'APPROVED') {
      // Prevent two competing claims from being approved for the same item
      const alreadyApproved = await prisma.claim.findFirst({
        where: {
          itemId: claim.itemId,
          id: { not: claimId },
          status: 'APPROVED',
        },
      });
      if (alreadyApproved) {
        return {
          success: false,
          error: 'Another claim has already been approved for this item. Cannot approve competing claims.',
        };
      }

      // Update approved claim
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'APPROVED' },
      });

      // Update item status to CLAIMED (removes from active Lost/Found listings, places in Claimed section)
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'CLAIMED' },
      });

      // Automatically reject any competing PENDING claims for this item
      await prisma.claim.updateMany({
        where: {
          itemId: claim.itemId,
          id: { not: claimId },
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      });

      // Award Points to finder (+50 points and Campus Hero badge)
      if (claim.item.userId) {
        await prisma.user.update({
          where: { id: claim.item.userId },
          data: {
            points: { increment: 50 },
            badge: 'Campus Hero',
          },
        });
      }

      await recordAudit(
        'CLAIM_APPROVED',
        'CLAIM',
        claim.id,
        user.email,
        'ADMIN',
        { itemId: claim.itemId, claimantName: claim.claimantName, itemTitle: claim.item.title }
      );
    } else {
      // Claim is REJECTED
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: 'REJECTED' },
      });

      // If no other approved claim exists, keep the item available (OPEN)
      const otherApproved = await prisma.claim.findFirst({
        where: { itemId: claim.itemId, status: 'APPROVED' },
      });

      if (!otherApproved) {
        await prisma.item.update({
          where: { id: claim.itemId },
          data: { status: 'OPEN' },
        });
      }

      await recordAudit(
        'CLAIM_REJECTED',
        'CLAIM',
        claim.id,
        user.email,
        'ADMIN',
        { itemId: claim.itemId, claimantName: claim.claimantName, itemTitle: claim.item.title }
      );
    }

    revalidatePath('/admin');
    revalidatePath('/browse');
    revalidatePath('/profile');
    revalidatePath(`/items/${claim.itemId}`);

    return { success: true, message: `Claim successfully marked as ${status}.` };
  } catch (error) {
    console.error('Error in resolveClaimAction:', error);
    return { success: false, error: 'Failed to update claim status.' };
  }
}

export async function resolveHandoverAction(itemId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized: Only administrators can record item handovers.' };
    }

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { claims: { where: { status: 'APPROVED' } } },
    });

    if (!item) {
      return { success: false, error: 'Item not found.' };
    }

    // Mark item as RESOLVED (Handover completed)
    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'RESOLVED' },
    });

    await recordAudit(
      'ITEM_HANDOVER_RESOLVED',
      'ITEM',
      item.id,
      user.email,
      'ADMIN',
      { itemTitle: item.title, location: item.location }
    );

    revalidatePath('/admin');
    revalidatePath('/browse');
    revalidatePath('/profile');
    revalidatePath(`/items/${itemId}`);

    return { success: true, message: 'Item physical handover marked as completed (RESOLVED)!' };
  } catch (error) {
    console.error('Error in resolveHandoverAction:', error);
    return { success: false, error: 'Failed to record handover.' };
  }
}

export async function resolveClaimFormAction(formData: FormData): Promise<void> {
  const claimId = formData.get('claimId') as string;
  const action = formData.get('action') as 'APPROVED' | 'REJECTED';
  await resolveClaimAction(claimId, action);
}

export async function resolveHandoverFormAction(formData: FormData): Promise<void> {
  const itemId = formData.get('itemId') as string;
  await resolveHandoverAction(itemId);
}
