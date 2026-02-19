import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './upload-image.response';
const streamifier = require('streamifier');

@Injectable()
export class UploadImageService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream((error, result) => {
        if (error) {
          return reject(error);
        } else {    
          resolve(result as CloudinaryResponse);
        } 
        
      });
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
