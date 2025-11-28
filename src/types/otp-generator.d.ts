declare module 'otp-generator' {
  interface OTPOptions {
    digits?: boolean;
    upperCaseAlphabets?: boolean;
    lowerCaseAlphabets?: boolean;
    specialChars?: boolean;
  }

  export function generate(length?: number, options?: OTPOptions): string;
}
