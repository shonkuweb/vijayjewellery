import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { placedAt: 'desc' },
    });

    const formatted = orders.map((o) => {
      let parsedItems = [];
      try {
        parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
      } catch {
        parsedItems = [];
      }
      return {
        ...o,
        items: parsedItems,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const orderId = body.id || `VJC-${Date.now().toString().slice(-6)}`;
    const itemsStr = typeof body.items === 'string' ? body.items : JSON.stringify(body.items || []);

    const newOrder = await prisma.order.create({
      data: {
        id: orderId,
        customer: body.customer || body.name || 'Customer',
        phone: body.phone || '',
        email: body.email || null,
        address: body.address || '',
        pincode: body.pincode || '',
        notes: body.notes || null,
        items: itemsStr,
        subtotal: String(body.subtotal || body.total || '0'),
        total: String(body.total || body.subtotal || '0'),
        status: body.status || 'Pending',
        placedAt: body.placedAt ? new Date(body.placedAt) : new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        order: {
          ...newOrder,
          items: body.items || [],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const dataToUpdate = {};
    if (body.status !== undefined) dataToUpdate.status = body.status;
    if (body.notes !== undefined) dataToUpdate.notes = body.notes;
    if (body.customer !== undefined) dataToUpdate.customer = body.customer;
    if (body.phone !== undefined) dataToUpdate.phone = body.phone;
    if (body.address !== undefined) dataToUpdate.address = body.address;

    const updated = await prisma.order.update({
      where: { id: body.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
