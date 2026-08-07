export class Logger {
  static info(message: string, meta?: Record<string, any>) {
    console.log(JSON.stringify({
      level: 'INFO',
      message,
      meta,
      timestamp: new Date().toISOString()
    }));
  }

  static warn(message: string, meta?: Record<string, any>) {
    console.warn(JSON.stringify({
      level: 'WARN',
      message,
      meta,
      timestamp: new Date().toISOString()
    }));
  }

  static error(message: string, meta?: Record<string, any>) {
    console.error(JSON.stringify({
      level: 'ERROR',
      message,
      meta,
      timestamp: new Date().toISOString()
    }));
  }
}
