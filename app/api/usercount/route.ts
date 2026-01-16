
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Debug loglar
  console.log('supabaseUrl', supabaseUrl);
  console.log('supabaseServiceRoleKey', supabaseServiceRoleKey ? 'exists' : 'missing');

  const { count, error } = await supabase
    .from('auth.users')
    .select('id', { count: 'exact', head: true });

  console.log('count', count, 'error', error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count });
}
