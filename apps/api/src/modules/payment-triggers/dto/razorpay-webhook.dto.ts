export interface RazorpayPaymentEntity {
  id: string;
  order_id: string;
  amount: number; // paisa
  currency: string;
  status: string;
  contact?: string; // phone number
  email?: string;
  notes?: Record<string, string>;
  vpa?: string; // UPI VPA
  method?: string; // upi | card | netbanking | wallet
}

export interface RazorpayWebhookPayload {
  event: string; // payment.captured | payment.failed | refund.processed
  account_id: string;
  contains: string[];
  created_at: number;
  payload: {
    payment?: { entity: RazorpayPaymentEntity };
    refund?: { entity: { id: string; payment_id: string; amount: number; status: string } };
  };
}
