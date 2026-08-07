import { Env } from '../types';
import { DatabaseService } from './db';
import { Logger } from '../utils/logger';

export class NotificationService {
  private db: DatabaseService;

  constructor(env: Env) {
    this.db = new DatabaseService(env);
  }

  async sendNotification(userId: string, title: string, message: string, type: 'info' | 'alert' | 'success' = 'info') {
    Logger.info('Sending notification', { userId, title, type });
    const notification = await this.db.saveNotification(userId, title, message, type);
    return notification;
  }

  async listNotifications(userId: string) {
    return await this.db.getNotifications(userId);
  }
}
