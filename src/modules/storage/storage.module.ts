import { Module } from '@nestjs/common';
import { CloudinaryProvider } from './storage.provider';

@Module({
  providers: [CloudinaryProvider],
  exports: [CloudinaryProvider],
})
export class CloudinaryModule {}
