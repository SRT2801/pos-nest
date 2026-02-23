import { createClient } from '@supabase/supabase-js';

export const SupabaseProvider = {
  provide: 'SUPABASE',
  useFactory: () => {
    return createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
  },
};
