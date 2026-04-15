export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  #level: number;

  constructor(level: LogLevel = "info") {
    this.#level = LOG_LEVELS[level];
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.#level <= LOG_LEVELS.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.#level <= LOG_LEVELS.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.#level <= LOG_LEVELS.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.#level <= LOG_LEVELS.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();
