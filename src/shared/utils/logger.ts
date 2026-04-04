/**
 * Simple logger for debugging app state and lifecycle
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function formatTime(): string {
  return new Date().toISOString().split('T')[1].split('.')[0];
}

function log(level: LogLevel, label: string, message: string, data?: unknown) {
  if (!isDev) return;

  const time = formatTime();
  const prefix = `[${time}] [${label}]`;

  switch (level) {
    case 'debug':
      console.log(`${prefix} 🔵 ${message}`, data);
      break;
    case 'info':
      console.log(`${prefix} ℹ️  ${message}`, data);
      break;
    case 'warn':
      console.warn(`${prefix} ⚠️  ${message}`, data);
      break;
    case 'error':
      console.error(`${prefix} ❌ ${message}`, data);
      break;
  }
}

export const logger = {
  debug: (label: string, message: string, data?: unknown) =>
    log('debug', label, message, data),
  info: (label: string, message: string, data?: unknown) =>
    log('info', label, message, data),
  warn: (label: string, message: string, data?: unknown) =>
    log('warn', label, message, data),
  error: (label: string, message: string, data?: unknown) =>
    log('error', label, message, data),
};
