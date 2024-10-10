const isProd = process.env.NODE_ENV === 'production';

export const Logger = {
  info: (message: string, ...args: any[]) => {
    console.log(message, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(message, ...args);
  },
  debug: (message: string, ...args: any[]) => {
    if (!isProd) {
      console.debug(message, ...args);
    }
  },
};