'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { TopUpSchema } from '@repo/schema';

// Mock key for Stripe Elements scaffolding
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('TopupPage');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    // Simulate validation and API request
    try {
      TopUpSchema.parse({ amount });
      alert('Valid amount: Proceeding to Stripe payment...');
    } catch (err: any) {
      alert(err.errors?.[0]?.message || 'Invalid amount');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {/*
        PaymentElement automatically handles Apple Pay / Google Pay if available
        and configured in the Stripe Dashboard.
      */}
      <PaymentElement />
      <button
        disabled={!stripe}
        className="w-full mt-4 bg-indigo-600 text-white py-2 rounded font-semibold disabled:bg-indigo-300"
      >
        {t('payButton')} {amount} Kč
      </button>
    </form>
  );
};

export default function TopUpPageClient() {
  const t = useTranslations('TopupPage');
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) setAmount(parsed);
  };

  // Provide a mock clientSecret for UI scaffolding
  const options = {
    clientSecret: 'pi_3JvVwK2eZvKYlo2C1x9G8r3W_secret_abc123',
    appearance: { theme: 'stripe' as const },
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <p className="mb-4 text-gray-600">{t('description')}</p>

      <div className="max-w-md border p-4 rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">{t('selectAmount')}</h2>
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setAmount(500)}
            className={`flex-1 py-2 border rounded ${amount === 500 ? 'bg-blue-100 border-blue-500' : 'hover:bg-blue-50'}`}
          >
            500 Kč
          </button>
          <button
            type="button"
            onClick={() => setAmount(1000)}
            className={`flex-1 py-2 border rounded ${amount === 1000 ? 'bg-blue-100 border-blue-500' : 'hover:bg-blue-50'}`}
          >
            1000 Kč
          </button>
          <button
            type="button"
            onClick={() => setAmount(2000)}
            className={`flex-1 py-2 border rounded ${amount === 2000 ? 'bg-blue-100 border-blue-500' : 'hover:bg-blue-50'}`}
          >
            2000 Kč
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">{t('customAmount')}</label>
          <input
            type="number"
            value={customAmount}
            onChange={handleCustomAmountChange}
            className="w-full border p-2 rounded"
            placeholder="1000"
          />
        </div>

        {/* Render Stripe Elements with mock options for scaffolding */}
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm amount={amount} />
        </Elements>
      </div>
    </div>
  );
}
