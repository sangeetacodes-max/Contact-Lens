import { Env } from '../types';
import { Logger } from '../utils/logger';

const memoryKv = new Map<string, string>();

export class StorageService {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  /** Save Session or JSON object in KV_SESSIONS */
  async kvPut(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (this.env.KV_SESSIONS) {
      try {
        await this.env.KV_SESSIONS.put(key, stringValue, ttlSeconds ? { expirationTtl: ttlSeconds } : undefined);
        return;
      } catch (err: any) {
        Logger.warn('KV_SESSIONS put warning:', err.message);
      }
    }

    memoryKv.set(key, stringValue);
  }

  /** Get Session or JSON object from KV_SESSIONS */
  async kvGet<T = any>(key: string): Promise<T | null> {
    if (this.env.KV_SESSIONS) {
      try {
        const val = await this.env.KV_SESSIONS.get(key, 'text');
        if (val) {
          try {
            return JSON.parse(val) as T;
          } catch {
            return val as unknown as T;
          }
        }
      } catch (err: any) {
        Logger.warn('KV_SESSIONS get warning:', err.message);
      }
    }

    const val = memoryKv.get(key);
    if (val) {
      try {
        return JSON.parse(val) as T;
      } catch {
        return val as unknown as T;
      }
    }

    return null;
  }

  /** Archive raw log or event payload to R2 Storage */
  async r2PutLog(key: string, data: any): Promise<void> {
    if (this.env.R2_STORAGE) {
      try {
        await this.env.R2_STORAGE.put(key, JSON.stringify(data), {
          httpMetadata: { contentType: 'application/json' }
        });
        Logger.info('Archived log to R2 Storage', { key });
      } catch (err: any) {
        Logger.warn('R2_STORAGE put warning:', err.message);
      }
    }
  }
}
