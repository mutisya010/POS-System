import { Order, StoreSettings } from '../types/pos';
import { formatCurrency, formatDateTime } from './formatters';

export const generateReceiptHtml = (order: Order, store: StoreSettings): string => {
  const itemRows = order.items
    .map((item) => {
      const itemSubtotal = item.product.price * item.quantity;
      const discountText =
        item.discountPercent && item.discountPercent > 0
          ? `<div style="font-size: 11px; color: #666; padding-left: 8px;">Discount (${item.discountPercent}%): -${formatCurrency(
              itemSubtotal * (item.discountPercent / 100),
              store.currencySymbol
            )}</div>`
          : '';
      const notesText = item.notes
        ? `<div style="font-size: 11px; font-style: italic; color: #777; padding-left: 8px;">Note: ${item.notes}</div>`
        : '';

      return `
        <tr style="border-bottom: 1px dashed #e2e8f0;">
          <td style="padding: 6px 0; vertical-align: top;">
            <div style="font-weight: 600; font-size: 13px;">${item.product.name}</div>
            <div style="font-size: 11px; color: #555;">${item.quantity} x ${formatCurrency(
        item.product.price,
        store.currencySymbol
      )}</div>
            ${discountText}
            ${notesText}
          </td>
          <td style="padding: 6px 0; text-align: right; vertical-align: top; font-weight: 600; font-size: 13px;">
            ${formatCurrency(itemSubtotal, store.currencySymbol)}
          </td>
        </tr>
      `;
    })
    .join('');

  const tenderRows = order.tenders
    .map(
      (tender) => `
      <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 3px;">
        <span style="text-transform: capitalize;">${tender.method} tender:</span>
        <span>${formatCurrency(tender.amount, store.currencySymbol)}</span>
      </div>
      ${
        tender.tendered && tender.tendered > tender.amount
          ? `
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #555; margin-bottom: 3px;">
        <span>Cash Tendered:</span>
        <span>${formatCurrency(tender.tendered, store.currencySymbol)}</span>
      </div>`
          : ''
      }
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
            font-family: 'Courier New', Courier, monospace, -apple-system, BlinkMacSystemFont, sans-serif;
            color: #111827;
          }
          body {
            margin: 0;
            padding: 24px;
            background-color: #ffffff;
            display: flex;
            justify-content: center;
          }
          .receipt-container {
            width: 100%;
            max-width: 340px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            padding: 20px;
            background: #fff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header {
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 2px dashed #333;
          }
          .store-name {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.5px;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .store-info {
            font-size: 11px;
            color: #4b5563;
            line-height: 1.4;
          }
          .meta-info {
            font-size: 11px;
            margin: 12px 0;
            padding-bottom: 10px;
            border-bottom: 1px dashed #cbd5e1;
            line-height: 1.6;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 14px;
          }
          .totals-section {
            border-top: 1px dashed #333;
            padding-top: 10px;
            margin-top: 8px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 4px;
          }
          .grand-total {
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: 800;
            margin-top: 8px;
            padding-top: 6px;
            border-top: 2px solid #111;
            border-bottom: 2px solid #111;
            padding-bottom: 6px;
          }
          .tender-section {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px dashed #9ca3af;
          }
          .footer {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px dashed #333;
            font-size: 11px;
            text-align: center;
            color: #4b5563;
            line-height: 1.5;
          }
          .barcode {
            margin-top: 14px;
            font-family: monospace;
            font-size: 24px;
            letter-spacing: 4px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header center">
            <h1 class="store-name">${store.storeName}</h1>
            <div class="store-info">${store.tagline}</div>
            <div class="store-info">${store.address}</div>
            <div class="store-info">Tel: ${store.phone} | Tax ID: ${store.taxId}</div>
          </div>

          <div class="meta-info">
            <div style="display:flex; justify-content:space-between;">
              <span>Order #: <strong>${order.orderNumber}</strong></span>
              <span>Reg: ${store.terminalId}</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Date: ${formatDateTime(order.createdAt)}</span>
              <span>Cashier: ${order.cashierName}</span>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr style="border-bottom: 1px solid #111; font-size: 11px; text-transform: uppercase;">
                <th style="text-align: left; padding-bottom: 4px;">Item / Qty</th>
                <th style="text-align: right; padding-bottom: 4px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="totals-row">
              <span>Subtotal:</span>
              <span>${formatCurrency(order.subtotal, store.currencySymbol)}</span>
            </div>
            ${
              order.discountTotal > 0
                ? `<div class="totals-row" style="color: #dc2626;">
                    <span>Discount:</span>
                    <span>-${formatCurrency(order.discountTotal, store.currencySymbol)}</span>
                   </div>`
                : ''
            }
            <div class="totals-row">
              <span>Sales Tax (VAT):</span>
              <span>${formatCurrency(order.taxTotal, store.currencySymbol)}</span>
            </div>
            ${
              order.tip > 0
                ? `<div class="totals-row">
                    <span>Tip:</span>
                    <span>${formatCurrency(order.tip, store.currencySymbol)}</span>
                   </div>`
                : ''
            }
            <div class="grand-total">
              <span>TOTAL DUE:</span>
              <span>${formatCurrency(order.total, store.currencySymbol)}</span>
            </div>
          </div>

          <div class="tender-section">
            ${tenderRows}
            ${
              order.changeDue > 0
                ? `
            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-top: 6px; padding-top: 4px; border-top: 1px solid #eee;">
              <span>CHANGE GIVEN:</span>
              <span>${formatCurrency(order.changeDue, store.currencySymbol)}</span>
            </div>`
                : ''
            }
          </div>

          <div class="footer">
            <div>${store.receiptFooter.replace(/\n/g, '<br/>')}</div>
            <div class="barcode">||| |||| || | |||| |||</div>
            <div style="font-size: 10px; color: #9ca3af; margin-top: 4px;">${order.orderNumber}</div>
          </div>
        </div>
      </body>
    </html>
  `;
};

