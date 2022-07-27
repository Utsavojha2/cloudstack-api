import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { v2 } from 'cloudinary';

enum CLOUDINARY {
  PROVIDER = 'Cloudinary',
}

export const CloudinaryProvider = {
  provide: CLOUDINARY.PROVIDER,
  useFactory: (config: ConfigService) => {
    return v2.config({
      cloud_name: config.get('CLOUDINARY_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_SECRET_KEY'),
    });
  },
  inject: [ConfigService],
};

export const bufferToStream = (buffer: Buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  return stream;
};
