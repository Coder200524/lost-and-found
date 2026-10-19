'use server';

// Server Actions for Claims (FST Unit 3 & Unit 4)
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function submitClaimAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    const itemId = formData.get('itemId') as string;
    const claimantName = (formData.get('claimantName') as string) || user?.name || '';
    const claimantEmail = (formData.get('claimantEmail') as string) || user?.email || '';
    const proofDetails = formData.get('proofDetails') as string;

    if (!itemId || !claimantName || !claimantEmail || !proofDetails) {
      return { success: false, error: 'Please provide all verification details.' };
    }

    const claim = await prisma.claim.create({
      data: {
        itemId,
        claimantId: user?.id ?? null,
        claimantName,
        claimantEmail,
        proofDetails,
        status: 'PENDING',
      },
    });

    await prisma.item.update({
      where: { id: itemId },
      data: { status: 'CLAIMED' },
    });

    revalidatePath(`/items/${itemId}`);
    revalidatePath('/browse');
    revalidatePath('/admin');
    revalidatePath('/profile');

    return { success: true, claim, message: 'Claim submitted for verification!' };
  } catch (error) {
    console.error('Error in submitClaimAction:', error);
    return { success: false, error: 'Failed to submit claim.' };
  }
}

export async function resolveClaimAction(claimId: string, status: 'APPROVED' | 'REJECTED') {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can resolve claims.' };
    }

    const claim = await prisma.claim.update({
      where: { id: claimId },
      data: { status },
      include: { item: true },
    });

    if (status === 'APPROVED') {
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'RESOLVED' },
      });
    } else {
      await prisma.item.update({
        where: { id: claim.itemId },
        data: { status: 'OPEN' },
      });
    }

    revalidatePath('/admin');
    revalidatePath('/browse');
    revalidatePath(`/items/${claim.itemId}`);

    return { success: true, claim };
  } catch (error) {
    console.error('Error in resolveClaimAction:', error);
    return { success: false, error: 'Failed to update claim status.' };
  }
}
