import {
  cart,
  removeFromCart,
  findItemInCart,
  saveToLocalStorage,
  updateDeliveryOptionIdInCart
} from '../data/cart.js';
import { findProduct } from '../data/products.js';
import { formatCurrency } from '../utils/money.js';
import { deliveryOptions, getDateStringFormattedForDeliveryOption } from '../data/deliveryOptions.js'
import renderCheckout from '../checkout.js';

const CLASS_CART_ITEM_CONTAINER = 'js-cart-item-container';
const CLASS_QUANTITY_INPUT = 'js-quantity-input';
const CLASS_DELETE_QUANTITY_LINK = 'js-delete-quantity-link';
const CLASS_UPDATE_QUANTITY_LINK = 'js-update-quantity-link';
const CLASS_SAVE_QUANTITY_LINK = 'js-save-quantity-link';
const CLASS_IS_EDITING_QUANTITY = 'is-editing-quantity';

function renderCartSummaryHTML() {
  let cartSummaryHTML = '';

  cart.forEach(cartItem => {
    const product = findProduct(cartItem.productId);

    if (!product) {
      return;
    }

    const dateString = getDateStringFormattedForDeliveryOption(cartItem.deliveryOptionId);

    cartSummaryHTML += `
      <div class="cart-item-container ${CLASS_CART_ITEM_CONTAINER}-${product.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${product.image}">

          <div class="cart-item-details">
            <div class="product-name">
              ${product.name}
            </div>
            <div class="product-price">
              $${formatCurrency(product.priceCents)}
            </div>
            <div class="product-quantity">
              <span>
                Quantity: <span class="quantity-label">${cartItem.quantity}</span>
              </span>
              <span class="update-quantity-link link-primary ${CLASS_UPDATE_QUANTITY_LINK}" data-product-id="${product.id}">
                Update
              </span>
              <input class="quantity-input ${CLASS_QUANTITY_INPUT} ${CLASS_QUANTITY_INPUT}-${product.id}" data-product-id="${product.id}">
              <span class="save-quantity-link link-primary ${CLASS_SAVE_QUANTITY_LINK}" data-product-id="${product.id}">
                Save
              </span>
              <span class="delete-quantity-link link-primary ${CLASS_DELETE_QUANTITY_LINK}" data-product-id="${product.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            
            ${renderDeliveryOptionsHTML(product, cartItem)}
            
          </div>
        </div>
      </div>`;
  });

  return cartSummaryHTML;
}

function renderDeliveryOptionsHTML(product, cartItem) {
  let deliveryOptionsHTML = '';

  deliveryOptions.forEach(deliveryOption => {
    const dateString = getDateStringFormattedForDeliveryOption(deliveryOption.id);
    const isChecked = deliveryOption.id === cartItem.deliveryOptionId;
    const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatCurrency(deliveryOption.priceCents)} -`;

    deliveryOptionsHTML += `
     <div class="delivery-option">
        <input type="radio" ${isChecked ? 'checked' : ''} class="delivery-option-input js-delivery-option-input" data-delivery-option-id="${deliveryOption.id}" data-product-id="${product.id}" name="delivery-option-${product.id}">
        <div>
          <div class="delivery-option-date">
            ${dateString}
          </div>
          <div class="delivery-option-price">
            ${priceString} Shipping
          </div>
        </div>
     </div>
    `;
  });

  return deliveryOptionsHTML;
}

function displayOrderSummary() {
  const orderSummaryElement = document.querySelector('.js-order-summary');

  if (!orderSummaryElement) {
    return;
  }

  orderSummaryElement.innerHTML = renderCartSummaryHTML();
}

function addEventToElement(element, eventType, functionToExecute) {
  if (!element) {
    return;
  }

  element.addEventListener(eventType.toString(), functionToExecute)
}

function getCartItemContainerElement(productId) {
  const cartItemContainerElement = document.querySelector(`.${CLASS_CART_ITEM_CONTAINER}-${productId}`);
  if (!cartItemContainerElement) {
    return null;
  }
  return cartItemContainerElement;
}

function addClickEventForDeleteItemInCart() {
  document.querySelectorAll(`.${CLASS_DELETE_QUANTITY_LINK}`)?.forEach(link => {
    //const productId = link.dataset.productId;
    const { productId } = link.dataset; // [destructuring]

    addEventToElement(link, 'click', () => {
      removeFromCart(productId);
      renderCheckout();
    });
  });
}

function addClickEventForUpdateQuantity() {
  document.querySelectorAll(`.${CLASS_UPDATE_QUANTITY_LINK}`).forEach(link => {
    addEventToElement(link, 'click', () => {
      const { productId } = link.dataset;
      const cartItemContainerElement = getCartItemContainerElement(productId);

      if (!cartItemContainerElement) {
        return;
      }
      cartItemContainerElement.classList.add(`${CLASS_IS_EDITING_QUANTITY}`);
    })
  });
}

function isQuantityValid(quantity) {
  if (quantity < 0 || quantity >= 1000) {
    return false;
  }

  return true;
}

function getNewQuantityFromInput(productId) {
  const newQuantityElement = document.querySelector(`.${CLASS_QUANTITY_INPUT}-${productId}`);

  if (!newQuantityElement) {
    return 0;
  }

  const newQuantity = Number(newQuantityElement.value);

  if (!isQuantityValid(newQuantity)) {
    alert('Quantity must be at least 0 and less than 1000');
    return null;
  }

  return newQuantity;
}

function saveNewCartQuantity(productId, newQuantity) {
  const product = findItemInCart(cart, productId);
  if (!product) {
    return;
  }

  product.quantity = Number(newQuantity);
}

function removeIsEditingQuantityClass(productId) {
  const cartItemContainerElement = getCartItemContainerElement(productId);

  if (!cartItemContainerElement) {
    return;
  }

  cartItemContainerElement.classList.remove(`${CLASS_IS_EDITING_QUANTITY}`);
}

function updateCartQuantity(productId) {
  const newQuantity = getNewQuantityFromInput(productId);

  if (newQuantity === null) {
    return;
  }

  saveNewCartQuantity(productId, newQuantity);
  saveToLocalStorage();
  renderCheckout();
}

function addClickEventForSaveQuantity() {
  document.querySelectorAll(`.${CLASS_SAVE_QUANTITY_LINK}`).forEach(link => {
    addEventToElement(link, 'click', () => {
      const { productId } = link.dataset;
      removeIsEditingQuantityClass(productId);
      updateCartQuantity(productId);
    });
  });
}

function addKeydownEventForSaveQuantity() {
  document.querySelectorAll(`.${CLASS_QUANTITY_INPUT}`)?.forEach(input => {
    addEventToElement(input, 'keydown', (event) => {
      if (event?.key === 'Enter') {
        const { productId } = input.dataset;
        removeIsEditingQuantityClass(productId);
        updateCartQuantity(productId);
      }
    });
  });
}

function addClickEventForDeliveryOptions() {
  document.querySelectorAll('.js-delivery-option-input')?.forEach(option => {
    addEventToElement(option, 'click', () => {
      const { deliveryOptionId, productId } = option.dataset;
      updateDeliveryOptionIdInCart(deliveryOptionId, productId);
      renderCheckout();
    });
  });
}

function addEventHandlers() {
  addClickEventForDeleteItemInCart();
  addClickEventForUpdateQuantity();
  addClickEventForSaveQuantity();
  addKeydownEventForSaveQuantity();
  addClickEventForDeliveryOptions();
}

export function renderOrderSummary() {
  displayOrderSummary();
  addEventHandlers();
}