import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Booking, Category, EventItem, Order, Product, ResourceItem } from './api.models';
import { map } from 'rxjs/operators';

type ListResponse<T> = { value: T[] };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  private unwrapList<T>(response: T[] | ListResponse<T> | null | undefined): T[] {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.value)) return response.value;
    return [];
  }

  // Auth is in AuthService

  categories() {
    return this.http
      .get<Category[] | ListResponse<Category>>(`${this.base}/categories`)
      .pipe(map(r => this.unwrapList(r)));
  }

  createCategory(name: string) {
    return this.http.post<Category>(`${this.base}/categories`, { name });
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  events() {
    return this.http
      .get<EventItem[] | ListResponse<EventItem>>(`${this.base}/events`)
      .pipe(map(r => this.unwrapList(r)));
  }

  event(id: string) {
    return this.http.get<EventItem>(`${this.base}/events/${id}`);
  }

  createEvent(payload: Partial<EventItem>) {
    return this.http.post<EventItem>(`${this.base}/events`, payload);
  }

  updateEvent(id: string, payload: Partial<EventItem>) {
    return this.http.put<EventItem>(`${this.base}/events/${id}`, payload);
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.base}/events/${id}`);
  }

  createBooking(eventId: string, quantity: number, paymentMethod: string) {
    return this.http.post<Booking>(`${this.base}/bookings`, { eventId, quantity, paymentMethod });
  }

  myBookings() {
    return this.http.get<Booking[]>(`${this.base}/bookings/mine`);
  }

  products() {
    return this.http
      .get<Product[] | ListResponse<Product>>(`${this.base}/products`)
      .pipe(map(r => this.unwrapList(r)));
  }

  createProduct(payload: Partial<Product>) {
    return this.http.post<Product>(`${this.base}/products`, payload);
  }

  updateProduct(id: string, payload: Partial<Product>) {
    return this.http.put<Product>(`${this.base}/products/${id}`, payload);
  }

  deleteProduct(id: string) {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  createOrder(items: Array<{ productId: string; quantity: number }>, paymentMethod: string) {
    return this.http.post<Order>(`${this.base}/orders`, { items, paymentMethod });
  }

  myOrders() {
    return this.http.get<Order[]>(`${this.base}/orders/mine`);
  }

  resources() {
    return this.http
      .get<ResourceItem[] | ListResponse<ResourceItem>>(`${this.base}/resources`)
      .pipe(map(r => this.unwrapList(r)));
  }

  uploadResource(form: { title: string; description?: string; eventId?: string; file: File }) {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description ?? '');
    fd.append('eventId', form.eventId ?? '');
    fd.append('file', form.file);
    return this.http.post<ResourceItem>(`${this.base}/resources`, fd);
  }

  deleteResource(id: string) {
    return this.http.delete<void>(`${this.base}/resources/${id}`);
  }

  adminStats() {
    return this.http.get<{ totalEvents: number; totalBookings: number; totalOrders: number }>(
      `${this.base}/admin/stats`
    );
  }
}

