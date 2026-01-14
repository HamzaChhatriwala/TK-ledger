import type { Customer } from '../../types';
import type { LedgerEntry } from '../hooks/useLedger';

export function formatLedgerForWhatsApp(
  customer: Customer,
  entries: LedgerEntry[],
  currentBalance: number
): string {
  let message = `*Ledger Statement for ${customer.name}*\n\n`;
  message += `Customer ID: ${customer.customer_id}\n`;
  if (customer.phone) {
    message += `Phone: ${customer.phone}\n`;
  }
  message += `\n*Current Balance: ₹${Math.abs(currentBalance).toLocaleString()}*\n`;
  
  if (currentBalance < 0) {
    message += `(Customer owes you)\n`;
  } else if (currentBalance > 0) {
    message += `(You owe customer)\n`;
  } else {
    message += `(Settled)\n`;
  }
  
  message += `\n*Transaction History:*\n\n`;
  
  if (entries.length === 0) {
    message += `No transactions found.\n`;
  } else {
    entries.forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      
      if (entry.type === 'invoice') {
        message += `${index + 1}. *Invoice* ${entry.reference || 'N/A'}\n`;
        message += `   Date: ${date}\n`;
        message += `   Amount: ₹${entry.debit.toLocaleString()}\n`;
        message += `   Balance: ₹${entry.balance.toLocaleString()}\n\n`;
      } else {
        message += `${index + 1}. *Payment* - ${entry.payment?.method || 'N/A'}\n`;
        message += `   Date: ${date}\n`;
        if (entry.reference) {
          message += `   Ref: ${entry.reference}\n`;
        }
        message += `   Amount: ₹${entry.credit.toLocaleString()}\n`;
        message += `   Balance: ₹${entry.balance.toLocaleString()}\n\n`;
      }
    });
  }
  
  message += `\n_Generated from Toy Kingdom Ledger System_`;
  
  return message;
}

export function getWhatsAppUrl(phoneNumber: string, message: string): string {
  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // WhatsApp URL format: https://wa.me/PHONENUMBER?text=MESSAGE
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phoneNumber: string, message: string): void {
  if (typeof window !== 'undefined') {
    const url = getWhatsAppUrl(phoneNumber, message);
    window.open(url, '_blank');
  }
}




