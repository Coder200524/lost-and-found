'use server';

// Server Actions for Item Mutations (FST Unit 3: React Server Components & Server Actions)
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

export async function createItemAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const dateOccurred = (formData.get('dateOccurred') as string) || new Date().toISOString().split('T')[0];
    const imageUrl = (formData.get('imageUrl') as string) || '';
    const reward = (formData.get('reward') as string) || '';
    const contactName = (formData.get('contactName') as string) || (user?.name ?? 'Anonymous Student');
    const contactEmail = (formData.get('contactEmail') as string) || (user?.email ?? 'student@djsce.edu');
    const contactPhone = (formData.get('contactPhone') as string) || '';

    if (!title || !description || !category || !type || !location) {
      return { success: false, error: 'Please fill in all mandatory fields.' };
    }

    // Mindmap Rule: "Post Found Item: MANDATORY IMAGE!"
    if (type.toUpperCase() === 'FOUND' && (!imageUrl || imageUrl.trim() === '')) {
      return { success: false, error: 'A photo is MANDATORY for all Found items to enable verification!' };
    }

    const locLower = location.toLowerCase();
    const isHotspot =
      locLower.includes('canteen') ||
      locLower.includes('library') ||
      locLower.includes('402') ||
      locLower.includes('lab') ||
      locLower.includes('gymkhana');

    const isMasked = category === 'ID Cards' || title.toLowerCase().includes('id');
    const isUrgent = (formData.get('isUrgent') as string) === 'true';

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        type: type.toUpperCase(),
        location,
        isHotspot,
        isMasked,
        isUrgent,
        dateOccurred,
        imageUrl,
        reward,
        contactName,
        contactEmail,
        contactPhone,
        userId: user?.id ?? null,
        status: 'OPEN',
      },
    });

    // Mongoose Document Store Audit Log (FST Unit 4)
    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: 'SERVER_ACTION_ITEM_CREATED',
          entityType: 'ITEM',
          entityId: item.id,
          performedBy: contactEmail,
          role: user?.role || 'GUEST',
          details: { title, type, category },
        });
      }
    } catch {}

    // Cache Revalidation (FST Unit 3 Caching Architectures)
    revalidatePath('/browse');
    revalidatePath('/');
    revalidatePath('/profile');

    return { success: true, item, message: 'Item successfully posted!' };
  } catch (error) {
    console.error('Server action error:', error);
    return { success: false, error: 'Failed to post item via server action.' };
  }
}

export async function updateItemStatusAction(itemId: string, newStatus: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const item = await prisma.item.update({
      where: { id: itemId },
      data: { status: newStatus.toUpperCase() },
    });

    revalidatePath('/browse');
    revalidatePath(`/items/${itemId}`);
    revalidatePath('/profile');
    revalidatePath('/admin');

    return { success: true, item };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'Status update failed' };
  }
}
