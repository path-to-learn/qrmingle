import { registerPlugin } from '@capacitor/core';

export interface IAPProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  displayPrice: string;
}

export interface PurchaseResult {
  transactionId: number;
  originalTransactionId: number;
  productId: string;
  jwsRepresentation: string;
}

interface IAPPlugin {
  getProducts(options: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchase(options: { productId: string }): Promise<PurchaseResult>;
  restorePurchases(): Promise<{ transactions: PurchaseResult[] }>;
}

export const IAP = registerPlugin<IAPPlugin>('IAP');
export const PREMIUM_PRODUCT_ID = 'com.qrmingle.app.premium';
