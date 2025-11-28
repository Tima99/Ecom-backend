import otp from 'otp-generator';

export class OtpUtil {
  static generate() {
    return otp.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }
}
