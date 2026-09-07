import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon || 'diamond',
      image: c.image || '',
      order: c.order,
      count: c._count.products,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, icon, image, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    let cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) cleanSlug = `category-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = cleanSlug;
    let count = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${cleanSlug}-${count++}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        icon: icon || 'diamond',
        image: image || '',
        order: order ? parseInt(order, 10) : 0,
      },
    });

    return NextResponse.json({ message: 'Category added successfully', category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Failed to add category:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (!slug && !id) {
      return NextResponse.json({ error: 'Slug or ID is required' }, { status: 400 });
    }

    const where = id ? { id: parseInt(id, 10) } : { slug };
    const existing = await prisma.category.findFirst({ where });

    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await prisma.category.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
