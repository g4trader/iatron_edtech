export interface LogContext {
  requestId?: string;
  [key: string]: unknown;
}
export interface Logger {
  info(context: LogContext, message: string): void;
  error(context: LogContext, message: string): void;
}

export function createJsonLogger(service: string): Logger {
  const write = (
    severity: 'INFO' | 'ERROR',
    context: LogContext,
    message: string,
  ): void => {
    const entry = JSON.stringify({ severity, service, message, ...context });
    if (severity === 'ERROR') console.error(entry);
    else console.info(entry);
  };
  return {
    info: (context, message) => write('INFO', context, message),
    error: (context, message) => write('ERROR', context, message),
  };
}
