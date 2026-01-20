const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg: string, data?: any) => {
    console.log(`[${timestamp()}] INFO: ${msg}`, data ?? '');
  },
  error: (msg: string, data?: any) => {
    console.error(`[${timestamp()}] ERROR: ${msg}`, data ?? '');
  },
  warn: (msg: string, data?: any) => {
    console.warn(`[${timestamp()}] WARN: ${msg}`, data ?? '');
  },
  debug: (msg: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp()}] DEBUG: ${msg}`, data ?? '');
    }
  }
};
