import { Module } from '@nestjs/common';
import { UploadImageService } from './upload-image.service';
import { SupabaseProvider } from './upload-image';

@Module({
  providers: [UploadImageService, SupabaseProvider],
  exports: [UploadImageService, SupabaseProvider],
})
export class UploadImageModule {}
