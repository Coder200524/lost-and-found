// REST Route Handler: /api/items (FST Unit 3 & Unit 4)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectMongoose } from '@/lib/mongoose';
import { AuditLog } from '@/models/AuditLog';

// GET /api/items - Supports search, category, type, status filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const type = searchParams.get('type') || ''; // LOST or FOUND
    const status = searchParams.get('status') || ''; // OPEN, CLAIMED, RESOLVED

    const whereClause: Record<string, unknown> = {};

    if (query) {
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { location: { contains: query } },
      ];
    }

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (type && type.toUpperCase() === 'CLAIMED') {
      whereClause.status = { in: ['CLAIMED', 'RESOLVED'] };
    } else if (type && type !== 'ALL') {
      whereClause.type = type.toUpperCase();
      if (!status) {
        whereClause.status = 'OPEN';
      }
    }

    if (status && status !== 'ALL') {
      if (status.toUpperCase() === 'CLAIMED') {
        whereClause.status = { in: ['CLAIMED', 'RESOLVED'] };
      } else {
        whereClause.status = status.toUpperCase();
      }
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, department: true, role: true, avatar: true },
        },
        claims: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error('Error in GET /api/items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create item (Used by Flutter Mobile App & Web Clients)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      category,
      type,
      location,
      dateOccurred,
      imageUrl,
      reward,
      contactName,
      contactEmail,
      contactPhone,
      userId,
    } = body;

    if (!title || !description || !category || !type || !location || !contactName || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required item fields' },
        { status: 400 }
      );
    }

    const emailLower = (contactEmail || '').trim().toLowerCase();
    if (emailLower && !emailLower.endsWith('@svkmmumbai.onmicrosoft.com') && !emailLower.startsWith('admin')) {
      return NextResponse.json(
        { success: false, error: 'Compulsory SVKM Email Suffix: Email must end with @svkmmumbai.onmicrosoft.com' },
        { status: 400 }
      );
    }

    // Mindmap Rule: "Post Found Item: MANDATORY IMAGE!"
    if (type.toUpperCase() === 'FOUND' && (!imageUrl || imageUrl.trim() === '')) {
      return NextResponse.json(
        { success: false, error: 'A photo is MANDATORY for all Found items to enable verification!' },
        { status: 400 }
      );
    }

    const locLower = location.toLowerCase();
    const isHotspot =
      locLower.includes('canteen') ||
      locLower.includes('library') ||
      locLower.includes('402') ||
      locLower.includes('lab') ||
      locLower.includes('gymkhana');

    const isMasked = category === 'ID Cards' || title.toLowerCase().includes('id');

    const newItem = await prisma.item.create({
      data: {
        title,
        description,
        category,
        type: type.toUpperCase(),
        location,
        isHotspot,
        isMasked,
        dateOccurred: dateOccurred || new Date().toISOString().split('T')[0],
        imageUrl: imageUrl || '',
        reward: reward || '',
        contactName,
        contactEmail,
        contactPhone: contactPhone || '',
        userId: userId || null,
        status: 'OPEN',
      },
    });

    // Mongoose audit log (FST Unit 4)
    try {
      const mConn = await connectMongoose();
      if (mConn) {
        await AuditLog.create({
          action: 'ITEM_CREATED',
          entityType: 'ITEM',
          entityId: newItem.id,
          performedBy: contactEmail,
          role: 'USER',
          details: { title, type, category, location },
        });
      }
    } catch (mErr) {
      console.warn('Mongoose audit log skipped:', mErr);
    }

    return NextResponse.json(
      { success: true, message: 'Item posted successfully', data: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
