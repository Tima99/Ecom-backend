import 'multer';

export abstract class StorageAdapter {
  abstract uploadFile(file: Express.Multer.File, folderPath?: string): Promise<string>;
  abstract uploadMultipleFiles(files: Express.Multer.File[], folderPath?: string): Promise<string[]>;
  abstract deleteFile(fileUrl: string): Promise<void>;
  abstract getSignedUrl(fileUrl: string, expiresIn?: number): Promise<string>;
}