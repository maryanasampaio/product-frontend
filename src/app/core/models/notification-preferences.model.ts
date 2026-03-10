/**
 * Modelo de Preferências de Notificação
 * Define como o usuário deseja receber notificações de novos produtos
 */

export interface NotificationPreferences {
  id?: number;
  userId?: string;
  whatsapp: WhatsAppPreferences;
  email: EmailPreferences;
  push: PushPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WhatsAppPreferences {
  enabled: boolean;
  phoneNumber: string;  // Formato: 5582999999999 (com código do país)
}

export interface EmailPreferences {
  enabled: boolean;
  emailAddress: string;
}

export interface PushPreferences {
  enabled: boolean;
  subscription?: PushSubscription;  // Token do navegador
}

/**
 * DTO para salvar preferências
 */
export interface SaveNotificationPreferencesRequest {
  whatsappEnabled: boolean;
  whatsappPhone: string;
  emailEnabled: boolean;
  emailAddress: string;
  pushEnabled: boolean;
  pushSubscription?: any;
}

/**
 * Resposta do backend
 */
export interface NotificationPreferencesResponse {
  success: boolean;
  message: string;
  preferences?: NotificationPreferences;
}

/**
 * Estatísticas de notificações (para dashboard admin)
 */
export interface NotificationStats {
  totalSubscribers: number;
  whatsappSubscribers: number;
  emailSubscribers: number;
  pushSubscribers: number;
  lastNotificationSent?: Date;
  deliveryRate: number;
}
