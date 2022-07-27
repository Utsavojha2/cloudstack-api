import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';

@Injectable()
export class SharpPipe
  implements PipeTransform<ReadonlyArray<Express.Multer.File>, Promise<any>>
{
  async transform(images: ReadonlyArray<Express.Multer.File>): Promise<any> {
    const postImageSizes = ['480', '640', '1080'];
    return await Promise.all(
      images.map(async (image) => {
        const fileName = uuid();
        return await Promise.all(
          postImageSizes.map(async (imageSize) => {
            const imageKey = `${fileName}_${imageSize}`;
            const buffer = await sharp(image.buffer)
              .resize(+imageSize)
              .toFormat('webp')
              .webp({ effort: 3 })
              .toBuffer();

            return { [imageKey]: buffer };
          }),
        );
      }),
    );
  }
}
