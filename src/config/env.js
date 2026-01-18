const fallbackEnv = import.meta.env.DEV ? 'development' : 'production'

export const appEnv = import.meta.env.VITE_APP_ENV || fallbackEnv
export const isDevelopment = appEnv === 'development'
export const isProduction = appEnv === 'production'
