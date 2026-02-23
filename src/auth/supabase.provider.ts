import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';

export const SupabaseAuthProvider = {
  provide: 'SUPABASE_AUTH',
  useFactory: (configService: ConfigService) => {
    return createClient(
      configService.get<string>('SUPABASE_URL')!,
      configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  },
  inject: [ConfigService],
};
