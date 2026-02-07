// =============================================
// API ROUTE: Reset Password
// File: app/api/admin/reset-password/route.ts
// =============================================

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ⚠️ PENTING: Pakai service_role key, bukan anon key!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ⚠️ Harus ada di .env
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { auth_user_id, new_password } = await request.json();

    // Validasi input
    if (!auth_user_id || !new_password) {
      return NextResponse.json(
        { success: false, error: 'auth_user_id dan new_password wajib diisi' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Verifikasi user yang melakukan request adalah admin
    // (Opsional, tergantung kebutuhan security)
    // const session = await getSession(request);
    // if (!session?.user?.is_admin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 403 }
    //   );
    // }

    // Update password menggunakan Admin API
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      auth_user_id,
      { password: new_password }
    );

    if (error) {
      console.error('Error updating password:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diupdate',
      data,
    });
  } catch (error) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}