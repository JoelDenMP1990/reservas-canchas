import { Transform } from 'class-transformer';
import xss from 'xss';

export function Sanitize() {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return xss(value, {
        whiteList: {}, // No permite ningún tag HTML
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script', 'style'],
      });
    }
    if (typeof value === 'object' && value !== null) {
      return sanitizeObject(value);
    }
    return value;
  });
}

function sanitizeObject(obj: any): any {
  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = xss(value, {
          whiteList: {},
          stripIgnoreTag: true,
        });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}