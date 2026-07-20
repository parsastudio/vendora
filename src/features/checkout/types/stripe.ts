export interface StripeWebhookMetadata {
  orderId: string;
  tenantId: string;
}

export interface StripePaymentSessionData {
  id: string;
  metadata: StripeWebhookMetadata;
  amount_total: number | null;
  payment_status: string;
}
