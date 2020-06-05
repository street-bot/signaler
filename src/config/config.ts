export class Config {
  port: number;
  logLevel: string;

  constructor() {
    this.port = 8080 || process.env.PORT;
    this.logLevel = 'info' || process.env.LOG_LEVEL;
  }
}