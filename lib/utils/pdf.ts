// PDF generation utility (client-side)
// Note: html2pdf.js works best in browser environment

export async function generateInvoicePDF(
  invoiceData: {
    invoice_no: string;
    date: string;
    customer?: { name: string; address?: string; phone?: string; email?: string };
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: number;
      tax_percent: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  }
): Promise<Blob> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-info { margin-bottom: 20px; }
        .customer-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Toy Kingdom</h1>
        <h2>Invoice</h2>
      </div>
      <div class="invoice-info">
        <p><strong>Invoice No:</strong> ${invoiceData.invoice_no}</p>
        <p><strong>Date:</strong> ${invoiceData.date}</p>
      </div>
      ${invoiceData.customer ? `
      <div class="customer-info">
        <p><strong>Customer:</strong> ${invoiceData.customer.name}</p>
        ${invoiceData.customer.address ? `<p>${invoiceData.customer.address}</p>` : ''}
        ${invoiceData.customer.phone ? `<p>Phone: ${invoiceData.customer.phone}</p>` : ''}
        ${invoiceData.customer.email ? `<p>Email: ${invoiceData.customer.email}</p>` : ''}
      </div>
      ` : ''}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Tax %</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items
            .map(
              (item) => `
            <tr>
              <td>${item.product_name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.unit_price.toFixed(2)}</td>
              <td>${item.tax_percent}%</td>
              <td>₹${(item.quantity * item.unit_price * (1 + item.tax_percent / 100)).toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
      <div class="totals">
        <p>Subtotal: ₹${invoiceData.subtotal.toFixed(2)}</p>
        <p>Tax: ₹${invoiceData.tax.toFixed(2)}</p>
        <p>Discount: ₹${invoiceData.discount.toFixed(2)}</p>
        <p class="total-row">Total: ₹${invoiceData.total.toFixed(2)}</p>
      </div>
    </body>
    </html>
  `;

  return new Blob([htmlContent], { type: 'text/html' });
}

