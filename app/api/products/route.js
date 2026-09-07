import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    const where = {};
    if (categoryId && categoryId !== 'all') {
      where.categoryId = parseInt(categoryId, 10);
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formatted = products.map((p) => {
      let parsedSpecs = null;
      if (p.specs) {
        try {
          parsedSpecs = JSON.parse(p.specs);
        } catch {
          parsedSpecs = p.specs;
        }
      }
      return {
        ...p,
        specs: parsedSpecs,
        categoryName: p.category?.name || null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      price,
      oldPrice,
      categoryId,
      collectionTag,
      specs,
      description,
      image,
      featured,
      inStock,
    } = body;

    if (!title || !price) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 });
    }

    let baseSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!baseSlug) baseSlug = `piece-${Date.now()}`;

    // Ensure unique slug
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    const specsStr = specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null;

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        price: String(price).trim(),
        oldPrice: oldPrice ? String(oldPrice).trim() : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        collectionTag: collectionTag ? collectionTag.trim() : null,
        specs: specsStr,
        description: description ? description.trim() : '',
        image: image || '',
        featured: Boolean(featured),
        inStock: inStock !== false,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ message: 'Product added successfully', product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Failed to add product:', error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      price,
      oldPrice,
      categoryId,
      collectionTag,
      specs,
      description,
      image,
      featured,
      inStock,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update' }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (slug !== undefined) {
      const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      if (cleanSlug !== existing.slug) {
        const conflict = await prisma.product.findUnique({ where: { slug: cleanSlug } });
        if (!conflict) dataToUpdate.slug = cleanSlug;
      }
    }
    if (price !== undefined) dataToUpdate.price = String(price).trim();
    if (oldPrice !== undefined) dataToUpdate.oldPrice = oldPrice ? String(oldPrice).trim() : null;
    if (categoryId !== undefined) dataToUpdate.categoryId = categoryId ? parseInt(categoryId, 10) : null;
    if (collectionTag !== undefined) dataToUpdate.collectionTag = collectionTag ? collectionTag.trim() : null;
    if (specs !== undefined) dataToUpdate.specs = specs ? (typeof specs === 'string' ? specs : JSON.stringify(specs)) : null;
    if (description !== undefined) dataToUpdate.description = description ? description.trim() : '';
    if (image !== undefined) dataToUpdate.image = image;
    if (featured !== undefined) dataToUpdate.featured = Boolean(featured);
    if (inStock !== undefined) dataToUpdate.inStock = Boolean(inStock);

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({ message: 'Product updated successfully', product: updated });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
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

    const where = id ? { id } : { slug };
    const existing = await prisma.product.findFirst({ where });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: existing.id } });

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
