import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

async function getStoredPassword() {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: 'admin' },
    });
    if (user && user.password) {
      return user.password;
    }
  } catch (err) {
    console.error('Error reading admin auth from db:', err);
  }
  return process.env.ADMIN_PASSWORD || 'admin';
}

async function setStoredPassword(newPassword) {
  try {
    await prisma.adminUser.upsert({
      where: { id: 'admin' },
      update: { password: newPassword },
      create: { id: 'admin', password: newPassword },
    });
    return true;
  } catch (err) {
    console.error('Error saving admin password to db:', err);
    return false;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const currentPassword = await getStoredPassword();

    if (password === currentPassword) {
      const token = Buffer.from(`admin_auth_${Date.now()}_${Math.random().toString(36).substring(2)}`).toString('base64');
      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ error: 'Invalid password. Please try again.' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.trim().length < 4) {
      return NextResponse.json({ error: 'New password must be at least 4 characters long.' }, { status: 400 });
    }

    const storedPassword = await getStoredPassword();

    if (currentPassword !== storedPassword) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });
    }

    const success = await setStoredPassword(newPassword.trim());
    if (!success) {
      return NextResponse.json({ error: 'Failed to update password in database.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
