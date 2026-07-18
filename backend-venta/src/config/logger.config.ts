import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const errorTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
});

const combinedTransport = new DailyRotateFile({
  filename: 'logs/combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

const securityTransport = new DailyRotateFile({
  filename: 'logs/security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'warn',
  maxSize: '20m',
  maxFiles: '90d',
  format: logFormat,
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    errorTransport,
    combinedTransport,
    securityTransport,
    ...(process.env.NODE_ENV !== 'production'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
          }),
        ]
      : []),
  ],
});

export class LoggerService {
  info(message: string, meta?: any) {
    logger.info(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: any) {
    logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    logger.debug(message, meta);
  }

  security(event: string, details: any) {
    logger.warn(`[SECURITY] ${event}`, {
      type: 'security',
      event,
      ...details,
    });
  }

  loginFailed(email: string, ip: string, reason: string) {
    this.security('LOGIN_FAILED', {
      email,
      ip,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  loginSuccess(userId: string, email: string, ip: string) {
    this.security('LOGIN_SUCCESS', {
      userId,
      email,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  criticalChange(action: string, userId: string, details: any) {
    this.security('CRITICAL_CHANGE', {
      action,
      userId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  }
}