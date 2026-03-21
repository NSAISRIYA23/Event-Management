import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

type BookingInvoiceInput = {
  bookingId: string;
  createdAtUtc: string;
  paymentMethod: string;
  quantity: number;
  totalAmount: number;
  eventTitle?: string;
  eventLocation?: string;
  eventStartUtc?: string;
};

type OrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderInvoiceInput = {
  orderId: string;
  createdAtUtc: string;
  paymentMethod: string;
  totalAmount: number;
  lines: OrderLine[];
};

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  downloadBookingInvoice(input: BookingInvoiceInput) {
    const doc = this.createBaseDoc('BOOKING INVOICE', `INV-BK-${input.bookingId.slice(0, 8).toUpperCase()}`);
    let y = 72;
    y = this.kv(doc, 'Booking ID', input.bookingId, y);
    y = this.kv(doc, 'Date', this.formatDate(input.createdAtUtc), y);
    y = this.kv(doc, 'Payment Method', input.paymentMethod, y);
    y = this.kv(doc, 'Tickets', String(input.quantity), y);
    if (input.eventTitle) y = this.kv(doc, 'Event', input.eventTitle, y);
    if (input.eventLocation) y = this.kv(doc, 'Location', input.eventLocation, y);
    if (input.eventStartUtc) y = this.kv(doc, 'Event Time', this.formatDate(input.eventStartUtc), y);

    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(16, y, 194, y);
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Total Amount', 16, y);
    doc.setFont('helvetica', 'bold');
    doc.text(this.money(input.totalAmount), 194, y, { align: 'right' });

    this.footer(doc);
    doc.save(`booking-invoice-${input.bookingId.slice(0, 8)}.pdf`);
  }

  downloadOrderInvoice(input: OrderInvoiceInput) {
    const doc = this.createBaseDoc('ORDER INVOICE', `INV-OR-${input.orderId.slice(0, 8).toUpperCase()}`);
    let y = 72;
    y = this.kv(doc, 'Order ID', input.orderId, y);
    y = this.kv(doc, 'Date', this.formatDate(input.createdAtUtc), y);
    y = this.kv(doc, 'Payment Method', input.paymentMethod, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Item', 16, y);
    doc.text('Qty', 122, y);
    doc.text('Price', 146, y);
    doc.text('Total', 194, y, { align: 'right' });
    y += 4;
    doc.setDrawColor(220, 220, 220);
    doc.line(16, y, 194, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    for (const line of input.lines) {
      if (y > 255) {
        doc.addPage();
        y = 24;
      }
      doc.text(this.truncate(line.name, 38), 16, y);
      doc.text(String(line.quantity), 122, y);
      doc.text(this.money(line.unitPrice), 146, y);
      doc.text(this.money(line.lineTotal), 194, y, { align: 'right' });
      y += 8;
    }

    y += 2;
    doc.line(16, y, 194, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total Amount', 16, y);
    doc.text(this.money(input.totalAmount), 194, y, { align: 'right' });

    this.footer(doc);
    doc.save(`order-invoice-${input.orderId.slice(0, 8)}.pdf`);
  }

  private createBaseDoc(title: string, invoiceNo: string) {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('EventSphere', 16, 16);
    doc.setFontSize(10);
    doc.text('Professional Event and Marketplace Platform', 16, 23);
    doc.setFontSize(12);
    doc.text(title, 194, 16, { align: 'right' });
    doc.setFontSize(10);
    doc.text(invoiceNo, 194, 23, { align: 'right' });
    return doc;
  }

  private kv(doc: jsPDF, key: string, value: string, y: number) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`${key}:`, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(this.truncate(value, 80), 52, y);
    return y + 8;
  }

  private footer(doc: jsPDF) {
    const y = 286;
    doc.setDrawColor(230, 230, 230);
    doc.line(16, y - 6, 194, y - 6);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Thank you for choosing EventSphere.', 16, y);
    doc.text('This is a system-generated invoice.', 194, y, { align: 'right' });
  }

  private money(amount: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      amount ?? 0
    );
  }

  private formatDate(iso: string) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private truncate(value: string, max: number) {
    if (!value) return '-';
    return value.length > max ? `${value.slice(0, max - 1)}...` : value;
  }
}

