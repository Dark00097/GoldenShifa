import { exec, row, bool, decimal } from './db';

export function serializeSettings(settings: any) {
  return {
    id: settings.id,
    deliveryFee: decimal(settings.deliveryFee),
    freeDelivery: bool(settings.freeDelivery),
    paymentMethodLabel: settings.paymentMethodLabel,
    paymentProvider: settings.paymentProvider,
    homeHeroImageUrl: settings.homeHeroImageUrl,
    homeStoryImageUrl: settings.homeStoryImageUrl,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt
  };
}

export async function getStoreSettings() {
  await exec(
    `
      INSERT IGNORE INTO StoreSetting
        (id, deliveryFee, freeDelivery, paymentMethodLabel, paymentProvider, createdAt, updatedAt)
      VALUES
        (1, 7, false, 'Paiement a la livraison', 'cash_on_delivery', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
    `
  );

  const settings = await row<any>('SELECT * FROM StoreSetting WHERE id = 1');
  return serializeSettings(settings);
}
