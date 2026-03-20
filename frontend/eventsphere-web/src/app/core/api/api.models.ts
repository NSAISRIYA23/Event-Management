export type Category = { id: string; name: string };

export type EventItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  startUtc: string;
  endUtc: string;
  price: number;
  capacity: number;
  categoryId: string;
  coverImageUrl: string;
  isActive: boolean;
};

export type Booking = {
  id: string;
  userId: string;
  eventId: string;
  quantity: number;
  totalAmount: number;
  status: string;
  confirmationFileUrl: string;
  confirmationPdfUrl: string;
  paymentMethod: string;
  createdAtUtc: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  receiptPdfUrl: string;
  status: string;
  createdAtUtc: string;
};

export type ResourceItem = {
  id: string;
  title: string;
  description: string;
  eventId: string;
  fileUrl: string;
  originalFileName: string;
  fileSizeBytes: number;
  createdAtUtc: string;
};

