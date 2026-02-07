// =============================================
// API ROUTE: Create Guru with Password
// File: app/api/admin/create-guru/route.ts
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ PENTING: Pakai service_role key untuk admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      nama,
      nip,
      jabatan,
      no_hp,
      is_admin,
      is_active,
      is_verified
    } = body;

    // Validasi input
    if (!email || !password || !nama) {
      return NextResponse.json(
        { success: false, error: 'Email, password, dan nama wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      console.error('Error creating auth user:', authError);

      // Handle duplicate email
      if (authError.message.includes('already registered')) {
        return NextResponse.json(
          { success: false, error: 'Email sudah terdaftar' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: authError.message },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { success: false, error: 'Gagal membuat user' },
        { status: 500 }
      );
    }

    // 2. Create guru record
    const { data: guruData, error: guruError } = await supabaseAdmin
      .from('guru')
      .insert({
        auth_user_id: authData.user.id,
        nama,
        email,
        nip: nip || null,
        jabatan: jabatan || null,
        no_hp: no_hp || null,
        is_admin: is_admin ?? false,
        is_active: is_active ?? true,
        is_verified: is_verified ?? true,
      })
      .select()
      .single();

    if (guruError) {
      console.error('Error creating guru:', guruError);

      // Rollback: delete auth user if guru creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { success: false, error: guruError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Guru berhasil ditambahkan',
      data: guruData,
    });

  } catch (error) {
    console.error('Create guru API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}