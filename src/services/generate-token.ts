import { createHmac, pbkdf2 } from 'crypto';
import { appPepper } from '../config/config';

export async function generatePasswordHash(
  password: string,
  salt: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const now = new Date().getTime();
    pbkdf2(
      `${password}${salt}${now}`,
      appPepper,
      1000,
      64,
      'sha512',
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey.toString('hex'));
        }
      }
    );
  });
}

export function createHmacDigestHex(key: string, text: string): string {
  return createHmac('sha256', key).update(text).digest('hex');
}
