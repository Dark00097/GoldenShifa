import { env } from '../config/env';

export type CheckoutPayload = {
  orderId: number;
  orderNumber: string;
  total: string;
  provider?: string;
};

export type CheckoutSession = {
  provider: string;
  status: 'pending';
  paymentRef: string;
  redirectUrl: string | null;
};

export async function createCheckoutSession(payload: CheckoutPayload): Promise<CheckoutSession> {
  const provider = payload.provider || env.PAYMENT_PROVIDER;

  if (!['manual', 'cash_on_delivery'].includes(provider)) {
    throw new Error(`Provider de paiement non configure: ${env.PAYMENT_PROVIDER}`);
  }

  return {
    provider,
    status: 'pending',
    paymentRef: `${provider.toUpperCase()}-${payload.orderNumber}`,
    redirectUrl: null
  };
}
