export class TimeUtil {
  static addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000);
  }

  static isExpired(date: Date): boolean {
    return new Date() > date;
  }
}
