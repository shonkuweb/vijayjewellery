import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
        ],
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let parsedSpecs = null;
    if (product.specs) {
      try {
        parsedSpecs = JSON.parse(product.specs);
      } catch {
        parsedSpecs = product.specs;
      }
    }

    return NextResponse.json({
      ...product,
      specs: parsedSpecs,
      categoryName: product.category?.name || null,
    });
  } catch (error) {
    console.error('Failed to fetch product by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
