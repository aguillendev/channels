export enum MessageType {
  TEXT = 'text',
  MEDIA = 'media',
  LIST_PICKER = 'list_picker',
  CTA = 'cta',
  QUICK_REPLY = 'quick_reply',
  CARD = 'card',
  CAROUSEL = 'carousel',
  CATALOG = 'catalog',
  WHATSAPP_CARD = 'whatsapp_card',
  WHATSAPP_OTP = 'whatsapp_otp',
  FLOWS = 'flows'
}

export enum PlatformType {
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  INSTAGRAM = 'instagram',
  SMS = 'sms'
}

export enum DeliveryStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}
