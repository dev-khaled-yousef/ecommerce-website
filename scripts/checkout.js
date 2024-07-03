import { renderOrderSummary } from './checkout/orderSummary.js';
import { renderPaymentSummary } from './checkout/paymentSummary.js';
import { renderCheckoutHeader } from './checkout/checkoutHeader.js';
import './data/cart-oop.js';

export default function renderCheckout() {
  renderOrderSummary();
  renderPaymentSummary();
  renderCheckoutHeader();
}

renderCheckout();