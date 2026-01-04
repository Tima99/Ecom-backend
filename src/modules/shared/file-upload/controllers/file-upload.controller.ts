import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UploadFileDto } from '../dto/upload-file.dto';
import { FileUploadService } from '../services/file-upload.service';

@ApiTags('File Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload single file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file or bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(@UploadedFile() file: Express.Multer.File, @Body() uploadDto: UploadFileDto) {
    return this.fileUploadService.uploadSingle(file, uploadDto);
  }

  @Post('upload-multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Files uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid files or bad request' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() uploadDto: UploadFileDto,
  ) {
    return this.fileUploadService.uploadMultiple(files, uploadDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id') id: string) {
    return this.fileUploadService.getFile(id);
  }

  @Get('folder/*path')
  @ApiOperation({ summary: 'Get files by folder path' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getFilesByFolder(@Req() req: any) {
    const folderPath = req.params.path; // Get everything after 'folder/'
    return this.fileUploadService.getFilesByFolder(folderPath);
  }

  @Post(':id/reference')
  @ApiOperation({ summary: 'Add reference to file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Reference added successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async addReference(@Param('id') id: string) {
    return this.fileUploadService.addReference(id);
  }

  @Delete(':id/reference')
  @ApiOperation({ summary: 'Remove reference from file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'Reference removed successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async removeReference(@Param('id') id: string) {
    return this.fileUploadService.removeReference(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete file (only if not referenced)' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'File is still being referenced' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id') id: string) {
    await this.fileUploadService.deleteFile(id);
    return { message: 'File deleted successfully' };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Cleanup unused files (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cleanup completed' })
  async cleanupUnusedFiles() {
    await this.fileUploadService.cleanupUnusedFiles();
    return { message: 'Cleanup completed successfully' };
  }
}
