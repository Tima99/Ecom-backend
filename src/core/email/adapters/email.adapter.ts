export abstract class EmailAdapter {
  abstract sendEmail(to: string, subject: string, message: string): Promise<void>;
}
