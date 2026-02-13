export const securityConfig = {
  bcryptRounds: 12, // Incrementado de 10 a 12
  maxLoginAttempts: 5,
  lockTimeMinutes: 30, // Incrementado de 15 a 30
  jwtAccessExpiration: '15m', // Reducido de 8h
  jwtRefreshExpiration: '7d',
  passwordMinLength: 12,
  sessionTimeout: 3600000, // 1 hora en ms
};