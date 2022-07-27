import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileFilterCallback, memoryStorage } from 'multer';
import { Request } from 'express';

export const multerOptions: MulterOptions = {
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (_req: Request, file, cb: FileFilterCallback) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      return cb(null, true);
    }
    cb(
      new HttpException(
        `Unsupported file type ${extname(file.originalname)}`,
        HttpStatus.BAD_REQUEST,
      ),
    );
  },
  storage: memoryStorage(),
};
