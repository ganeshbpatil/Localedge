export interface CashfreePaymentData {
  payment_id: string;
  order_id: string;
  payment_amount: number; // rupees
  payment_currency: string;
  payment_status: string;
  payment_method?: {
    upi?: { upi_id: string };
    card?: { card_number: string };
  };
  customer_details?: {
    customer_id: string;
    customer_phone: string;
    customer_email?: string;
  };
  order_tags?: Record<string, string>;
}

export interface CashfreeWebhookPayload {
  type: string; // PAYMENT_SUCCESS_WEBHOOK | PAYMENT_FAILED_WEBHOOK
  data: {
    payment: CashfreePaymentData;
    order?: { order_id: string; order_amount: number; order_tags?: Record<string, string> };
    customer_details?: CashfreePaymentData['customer_details'];
  };
}
