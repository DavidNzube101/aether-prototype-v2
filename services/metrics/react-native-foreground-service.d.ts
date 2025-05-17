declare module 'react-native-foreground-service' {
  interface NotificationConfig {
    id: string;
    name: string;
    description?: string;
    enableVibration?: boolean;
  }

  interface ServiceConfig {
    id: number;
    title: string;
    message: string;
    icon?: string;
    channelId: string;
  }

  export function createNotificationChannel(config: NotificationConfig): Promise<void>;
  export function startService(config: ServiceConfig): Promise<void>;
  export function stopService(): Promise<void>;
  export function stop(): void;
}