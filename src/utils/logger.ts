/**
 * Logger utility - Structured logging with colors and levels
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: COLORS.gray,
  info: COLORS.blue,
  warn: COLORS.yellow,
  error: COLORS.red,
};

const LEVEL_ICONS: Record<LogLevel, string> = {
  debug: '[D]',
  info: '[i]',
  warn: '[!]',
  error: '[X]',
};

export class Logger {
  private context: string;
  private logFile: string;
  private static globalLevel: LogLevel = 'info';

  constructor(context: string) {
    this.context = context;
    const logDir = path.join(os.homedir(), '.ai-installer-hub', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    this.logFile = path.join(logDir, `install-${new Date().toISOString().slice(0, 10)}.log`);
  }

  static setLevel(level: LogLevel): void {
    Logger.globalLevel = level;
  }

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log('error', message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    if (levels.indexOf(level) < levels.indexOf(Logger.globalLevel)) return;

    const timestamp = new Date().toISOString();
    const color = LEVEL_COLORS[level];
    const icon = LEVEL_ICONS[level];

    // Console output
    const consoleMsg = `${color}${icon}${COLORS.reset} ${COLORS.cyan}[${this.context}]${COLORS.reset} ${message}`;
    if (level === 'error') {
      console.error(consoleMsg, ...args);
    } else {
      console.log(consoleMsg, ...args);
    }

    // File output
    const fileMsg = `${timestamp} [${level.toUpperCase()}] [${this.context}] ${message} ${args.length ? JSON.stringify(args) : ''}\n`;
    try {
      fs.appendFileSync(this.logFile, fileMsg);
    } catch { /* ignore write errors */ }
  }

  banner(title: string): void {
    const line = '='.repeat(60);
    console.log(`${COLORS.cyan}${line}`);
    console.log(`  ${title}`);
    console.log(`${line}${COLORS.reset}`);
  }

  step(step: number, total: number, message: string): void {
    console.log(`${COLORS.green}[${step}/${total}]${COLORS.reset} ${message}`);
  }

  progress(message: string): void {
    console.log(`${COLORS.magenta}>>>${COLORS.reset} ${message}`);
  }

  success(message: string): void {
    console.log(`${COLORS.green}[OK]${COLORS.reset} ${message}`);
  }

  fail(message: string): void {
    console.log(`${COLORS.red}[FAIL]${COLORS.reset} ${message}`);
  }

  divider(): void {
    console.log(`${COLORS.gray}${'-'.repeat(60)}${COLORS.reset}`);
  }
}
