// REST Route Handler: /api/items/[id] (FST Unit 1 Dynamic Segments & Unit 3)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/items/[id]
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, department: true, role: true, avatar: true },
        },
        claims: true,
      },
    });

    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/items/[id] - Update item status or details
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedItem = await prisma.item.update({
      where: { id },
      data: body,
    });

    // Mongoose audit
    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: 'ITEM_UPDATED',
          entityType: 'ITEM',
          entityId: id,
          performedBy: body.updatedBy || 'SYSTEM',
          details: body,
        });
      }
    } catch {}

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/items/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}
