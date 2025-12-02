export abstract class StorageAdapter {
  abstract uploadFile(file: any, folderPath?: string): Promise<string>;
  abstract uploadMultipleFiles(files: any[], folderPath?: string): Promise<string[]>;
  abstract deleteFile(fileUrl: string): Promise<void>;
  abstract getSignedUrl(fileUrl: string, expiresIn?: number): Promise<string>;
}