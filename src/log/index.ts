import Pino from 'pino';

export function createLogger(): Pino.Logger {
  return Pino({}); 
}