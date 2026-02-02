import { BadRequestException, Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import ImageKit from 'imagekit';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
export class UploadController {
  private imagekit: ImageKit;

  constructor() {
    this.imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileName') fileName: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check if ImageKit is configured
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new BadRequestException('ImageKit is not configured on the server');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Upload to ImageKit
    try {
      const result = await this.imagekit.upload({
        file: file.buffer.toString('base64'),
        fileName: fileName || `upload_${Date.now()}`,
        folder: '/puzzles',
      });

      return {
        url: result.url,
        fileId: result.fileId,
        name: result.name,
      };
    } catch (error) {
      console.error('ImageKit upload error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }
}
