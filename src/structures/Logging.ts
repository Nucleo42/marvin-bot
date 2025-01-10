export * from "colors";

export default class Logging {
  static success(args: string) {
    console.log("✅ " + args.green);
  }

  static error(args: string) {
    console.log("❌" + args.red);
  }

  static warn(args: string) {
    console.log("⚠️" + args.yellow);
  }

  static info(args: string) {
    console.log("💠 " + args.blue);
  }
}
