import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { UploadResponse } from './upload-image.response.js';
import { StoreContextService } from '../common/cls/store-context.service.js';

@Injectable()
export class UploadImageService {
  constructor(
    @Inject('SUPABASE') private readonly supabase: SupabaseClient,
    private readonly storeContext: StoreContextService,
  ) {}

  async uploadFile(file: Express.Multer.File): Promise<UploadResponse> {
    const bucket = process.env.SUPABASE_BUCKET || 'products';
    const storeId = this.storeContext.getStoreId();
    const prefix = storeId ? `${storeId}/` : '';
    const fileName = `${prefix}${Date.now()}-${file.originalname}`;

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(`Upload failed: ${error.message}`);
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: publicUrlData.publicUrl,
      path: fileName,
    };
  }

  async uploadFiles(files: Express.Multer.File[]): Promise<UploadResponse[]> {
    return Promise.all(files.map((file) => this.uploadFile(file)));
  }
}
