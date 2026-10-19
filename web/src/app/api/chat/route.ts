// In-App Chat Route Handler (SVKM Mindmap: Communication System - Chat After Match & Safety Messages)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'itemId required' }, { status: 400 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { itemId },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Error in GET /api/chat:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Login with SAP ID.' }, { status: 401 });
    }

    const { itemId, content, isPredefinedSafety } = await request.json();

    if (!itemId || !content) {
      return NextResponse.json({ success: false, error: 'Missing chat content or item ID' }, { status: 400 });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        itemId,
        senderId: user.id,
        senderName: user.name,
        content: content.trim(),
        isPredefinedSafety: Boolean(isPredefinedSafety),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true, avatar: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/chat:', error);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
