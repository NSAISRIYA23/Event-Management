import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Booking, Category, EventItem, Order, OrderItem, Product, ResourceItem } from './api.models';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

type ListResponse<T> = { value: T[] };

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;
  private readonly BOOKINGS_KEY = 'es_local_bookings';
  private readonly ORDERS_KEY = 'es_local_orders';
  private readonly USER_KEY = 'es_user';
  private readonly fallbackCategories: Category[] = [
    { id: 'Tech', name: 'Tech' },
    { id: 'Startup Meetup', name: 'Startup Meetup' },
    { id: 'College Fest', name: 'College Fest' },
    { id: 'Music', name: 'Music' },
    { id: 'Comedy', name: 'Comedy' },
    { id: 'Hackathon', name: 'Hackathon' },
    { id: 'Workshop', name: 'Workshop' },
    { id: 'Concert', name: 'Concert' },
    { id: 'Tech Workshop', name: 'Tech Workshop' }
  ];
  private readonly fallbackEvents: EventItem[] = [
    {
      id: 'evt_techsummit_2026',
      title: 'Tech Summit 2026 - AI, Cloud & Cyber',
      description:
        'A one-day summit with keynote sessions, hands-on mini workshops, and networking with industry professionals. Designed for students and early-career engineers.',
      location: 'Bengaluru - Convention Hall A',
      startUtc: '2026-04-12T04:00:00Z',
      endUtc: '2026-04-12T12:30:00Z',
      categoryId: 'Tech',
      capacity: 350,
      price: 3200,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_startup_pitchnight_2026',
      title: 'Startup Pitch Night - Seed to Series A',
      description:
        'An energetic evening where founders pitch live to expert judges. Includes a founder meetup corner, curated networking rounds, and feedback sessions.',
      location: 'Hyderabad - Innovation Hub',
      startUtc: '2026-04-18T09:00:00Z',
      endUtc: '2026-04-18T12:00:00Z',
      categoryId: 'Startup Meetup',
      capacity: 220,
      price: 2800,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_collegefest_2026',
      title: 'College Fest 2026 - Cultural & Tech Expo',
      description:
        'A full-day fest featuring cultural performances, project showcases, esports finals, and a mini marketplace. Bring your friends and explore student innovation.',
      location: 'Pune - Campus Grounds',
      startUtc: '2026-04-20T03:30:00Z',
      endUtc: '2026-04-20T13:00:00Z',
      categoryId: 'College Fest',
      capacity: 1500,
      price: 2200,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_springbeats_2026',
      title: 'Spring Beats Live - Indie Night',
      description:
        'An evening of live indie performances with a curated lineup, food stalls, and a chill outdoor vibe. Entry includes a welcome drink.',
      location: 'Mumbai - Open Air Arena',
      startUtc: '2026-04-05T13:00:00Z',
      endUtc: '2026-04-05T16:30:00Z',
      categoryId: 'Music',
      capacity: 800,
      price: 3800,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_openmic_urban_2026',
      title: 'Open Mic Urban Jam - Comedy & Poetry',
      description:
        'A creative night of stand-up sets and poetic storytelling. Get on the stage through quick sign-ups and enjoy guest performances.',
      location: 'Delhi - Riverside Theatre',
      startUtc: '2026-04-25T12:30:00Z',
      endUtc: '2026-04-25T15:30:00Z',
      categoryId: 'Comedy',
      capacity: 260,
      price: 2400,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_campus_sprints_2026',
      title: 'Campus Sprints - Hack + Build Demo Day',
      description:
        'A short hackathon followed by a demo day. Teams of 3-5 build prototypes and pitch their solutions to a panel.',
      location: 'Chennai - Tech Square',
      startUtc: '2026-05-03T08:30:00Z',
      endUtc: '2026-05-03T14:30:00Z',
      categoryId: 'Hackathon',
      capacity: 300,
      price: 2600,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_cybersec_bootcamp_2026',
      title: 'CyberSec Bootcamp Day - Hands-on Threat Modeling',
      description:
        'A practical workshop on threat modeling, secure design patterns, and incident response playbooks. Includes guided lab exercises.',
      location: 'Gurugram - Security Lab',
      startUtc: '2026-05-10T05:30:00Z',
      endUtc: '2026-05-10T12:00:00Z',
      categoryId: 'Workshop',
      capacity: 120,
      price: 3000,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_neon_nights_2026',
      title: 'Neon Nights - Citywide Music Festival',
      description:
        'A multi-stage festival featuring live DJ sets and headline artists. Includes food courts, merchandise counters, and late-night vibes.',
      location: 'Pune - Riverfront Stage',
      startUtc: '2026-05-18T16:00:00Z',
      endUtc: '2026-05-19T00:00:00Z',
      categoryId: 'Concert',
      capacity: 1800,
      price: 4000,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_angular_buildshop_2026',
      title: 'Build Shop - Angular Workshop (Beginner to Pro)',
      description:
        'Hands-on workshop to build a polished Angular app. Learn routing, services, state patterns, and UI best practices.',
      location: 'Kolkata - Creator Studio',
      startUtc: '2026-05-24T07:00:00Z',
      endUtc: '2026-05-24T11:30:00Z',
      categoryId: 'Tech Workshop',
      capacity: 140,
      price: 2900,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: 'evt_founder_roundtable_2026',
      title: 'Founder Roundtable - Product, Growth & Hiring',
      description:
        'A closed-door discussion with experienced founders and operators. Includes a guided Q&A and curated networking.',
      location: 'Bengaluru - Co-Working Atrium',
      startUtc: '2026-06-01T08:00:00Z',
      endUtc: '2026-06-01T10:30:00Z',
      categoryId: 'Startup Meetup',
      capacity: 90,
      price: 2300,
      coverImageUrl: '',
      isActive: true
    },
    {
      id: '024f92d411d24c1f9864a94697f46f0a',
      title: 'Standup comedy',
      description: 'Jokes, laugh and live',
      location: 'Indira nagar, Bengaluru',
      startUtc: '2026-05-19T07:52:23.498Z',
      endUtc: '2026-05-19T09:52:23.498Z',
      categoryId: '',
      capacity: 100,
      price: 899,
      coverImageUrl:
        'https://media.istockphoto.com/id/2185341335/photo/empty-stage-with-red-curtains-spotlight-on-a-microphone-stand-with-wooden-floor-front-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=_d31xSE6143to4Sg3Q_GWpnGN-wb-Nb8TebCN6e3DHY=',
      isActive: true
    }
  ];
  private readonly fallbackProducts: Product[] = [
    {
      id: 'prd_pass_vip',
      name: 'VIP Access Pass Add-on',
      description: 'Fast entry lane + reserved seating section (where applicable).',
      price: 2800,
      stock: 236,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_merch_combo',
      name: 'Event Merch Combo (Tee + Badge)',
      description: 'Limited edition t-shirt with an enamel badge. Sizes selectable at pickup counter.',
      price: 3400,
      stock: 159,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_workshop_kit',
      name: 'Workshop Starter Kit',
      description: 'Notebook, pen, lanyard, and a quick reference card set for sessions.',
      price: 2500,
      stock: 517,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_premium_seat',
      name: 'Premium Seating Upgrade',
      description: 'Better view seating zone for concerts, keynotes, and high-demand workshops.',
      price: 3200,
      stock: 180,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_tshirt_neon',
      name: 'Neon Nights T-Shirt',
      description: 'Breathable festival t-shirt featuring a neon gradient print and soft-touch fabric.',
      price: 3000,
      stock: 300,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_badge_techpro',
      name: 'Tech Summit Pro Badge',
      description: 'Upgraded badge with QR scan access to lounges and session recordings.',
      price: 2700,
      stock: 420,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_badge_college',
      name: 'College Fest Student Badge',
      description: 'Student-friendly badge with discounted entry lanes (where applicable).',
      price: 2200,
      stock: 800,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_lanyard_tote',
      name: 'Lanyard + Tote Pack',
      description: 'Convenient lanyard and reusable tote bag for carrying workshop kits, maps, and merch.',
      price: 2400,
      stock: 600,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_certificate_pack',
      name: 'Workshop Certificate Printing Pack',
      description: 'Official printed certificates for team participants (template-based).',
      price: 2100,
      stock: 1000,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    },
    {
      id: 'prd_volunteer_kit',
      name: 'Volunteer Support Kit',
      description: 'Volunteer kit with quick-reference sheets, entry pass cover, and event guide booklet.',
      price: 2600,
      stock: 260,
      imageUrl: 'uploads/sample.jpg',
      isActive: true
    }
  ];
  private readonly fallbackResources: ResourceItem[] = [
    {
      id: 'res_event_playbook',
      title: 'Event Planning Playbook (PDF)',
      description:
        'A practical organizer playbook: timelines, vendor checklists, staffing roles, and day-of execution.',
      eventId: '',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'event-planning-playbook.pdf',
      fileSizeBytes: 248832,
      createdAtUtc: '2026-03-19T00:00:00Z'
    },
    {
      id: 'res_security_basics',
      title: 'Cyber Safety Basics for Attendees (PDF)',
      description: 'Quick guidance for secure Wi-Fi, phishing awareness, and device protection during public events.',
      eventId: 'evt_techsummit_2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'cyber-safety-basics.pdf',
      fileSizeBytes: 191692,
      createdAtUtc: '2026-03-19T00:00:00Z'
    },
    {
      id: 'res_startup_pitch_guide',
      title: 'Startup Pitch Guide (PDF)',
      description: 'How to craft a clear narrative: problem, solution, traction, roadmap, and a confident closing.',
      eventId: 'evt_startup_pitchnight_2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'startup-pitch-guide.pdf',
      fileSizeBytes: 212004,
      createdAtUtc: '2026-03-19T00:00:00Z'
    },
    {
      id: 'res_venue_setup_checklist',
      title: 'Venue Setup Checklist (PDF)',
      description: 'A concise checklist for layouts, stage requirements, accessibility checks, and signage templates.',
      eventId: 'evt_collegefest_2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'venue-setup-checklist.pdf',
      fileSizeBytes: 176540,
      createdAtUtc: '2026-03-19T00:00:00Z'
    },
    {
      id: 'res_workshop_lab_pack',
      title: 'Workshop Lab Pack (PDF)',
      description: 'Lab worksheets, quick reference pages, and a structured agenda for interactive sessions.',
      eventId: 'evt_cybersec_bootcamp_2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'workshop-lab-pack.pdf',
      fileSizeBytes: 204880,
      createdAtUtc: '2026-03-19T00:00:00Z'
    },
    {
      id: 'res_certificate_templates',
      title: 'Certificates & Templates (PDF)',
      description: 'Official certificate templates for teams and participants, ready for event organizers to print.',
      eventId: 'evt_campus_sprints_2026',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      originalFileName: 'certificate-templates.pdf',
      fileSizeBytes: 230120,
      createdAtUtc: '2026-03-19T00:00:00Z'
    }
  ];

  private unwrapList<T>(response: T[] | ListResponse<T> | null | undefined): T[] {
    if (Array.isArray(response)) return response;
    if (response && Array.isArray(response.value)) return response.value;
    return [];
  }

  private currentUserId(): string {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      const user = raw ? (JSON.parse(raw) as { id?: string }) : null;
      return user?.id ?? 'guest';
    } catch {
      return 'guest';
    }
  }

  private readLocal<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  private writeLocal<T>(key: string, items: T[]) {
    localStorage.setItem(key, JSON.stringify(items));
  }

  // Auth is in AuthService

  categories() {
    return this.http
      .get<Category[] | ListResponse<Category>>(`${this.base}/categories`)
      .pipe(
        map(r => this.unwrapList(r)),
        catchError(() => of(this.fallbackCategories))
      );
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
      .pipe(
        map(r => this.unwrapList(r)),
        catchError(() => of(this.fallbackEvents))
      );
  }

  event(id: string) {
    return this.http.get<EventItem>(`${this.base}/events/${id}`).pipe(
      catchError(() => {
        const found = this.fallbackEvents.find(e => e.id === id) ?? this.fallbackEvents[0];
        return of(found);
      })
    );
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
    return this.http
      .post<Booking>(`${this.base}/bookings`, { eventId, quantity, paymentMethod })
      .pipe(catchError(() => of(this.createBookingLocal(eventId, quantity, paymentMethod))));
  }

  myBookings() {
    return this.http
      .get<Booking[]>(`${this.base}/bookings/mine`)
      .pipe(catchError(() => of(this.myBookingsLocal())));
  }

  products() {
    return this.http
      .get<Product[] | ListResponse<Product>>(`${this.base}/products`)
      .pipe(
        map(r => this.unwrapList(r)),
        catchError(() => of(this.fallbackProducts))
      );
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
    return this.http
      .post<Order>(`${this.base}/orders`, { items, paymentMethod })
      .pipe(catchError(() => of(this.createOrderLocal(items, paymentMethod))));
  }

  myOrders() {
    return this.http
      .get<Order[]>(`${this.base}/orders/mine`)
      .pipe(catchError(() => of(this.myOrdersLocal())));
  }

  resources() {
    return this.http
      .get<ResourceItem[] | ListResponse<ResourceItem>>(`${this.base}/resources`)
      .pipe(
        map(r => this.unwrapList(r)),
        catchError(() => of(this.fallbackResources))
      );
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
    ).pipe(
      catchError(() =>
        of({
          totalEvents: this.fallbackEvents.length,
          totalBookings: 0,
          totalOrders: 0
        })
      )
    );
  }

  private createBookingLocal(eventId: string, quantity: number, paymentMethod: string): Booking {
    const userId = this.currentUserId();
    const event = this.fallbackEvents.find(e => e.id === eventId);
    const qty = Math.max(1, Math.floor(quantity));
    const booking: Booking = {
      id: (crypto?.randomUUID?.() ?? `b_${Date.now()}`).toString(),
      userId,
      eventId,
      quantity: qty,
      totalAmount: (event?.price ?? 0) * qty,
      status: 'Confirmed',
      confirmationFileUrl: '',
      confirmationPdfUrl: '',
      paymentMethod,
      createdAtUtc: new Date().toISOString()
    };
    const all = this.readLocal<Booking>(this.BOOKINGS_KEY);
    all.unshift(booking);
    this.writeLocal(this.BOOKINGS_KEY, all);
    return booking;
  }

  private myBookingsLocal(): Booking[] {
    const userId = this.currentUserId();
    return this.readLocal<Booking>(this.BOOKINGS_KEY).filter(b => b.userId === userId);
  }

  private createOrderLocal(
    items: Array<{ productId: string; quantity: number }>,
    paymentMethod: string
  ): Order {
    const userId = this.currentUserId();
    const productMap = new Map(this.fallbackProducts.map(p => [p.id, p] as const));
    const mappedItems: OrderItem[] = items
      .map(i => {
        const qty = Math.max(1, Math.floor(i.quantity));
        const product = productMap.get(i.productId);
        const unitPrice = product?.price ?? 0;
        return {
          productId: i.productId,
          name: product?.name ?? 'Product',
          quantity: qty,
          unitPrice,
          lineTotal: unitPrice * qty
        };
      })
      .filter(i => i.quantity > 0);

    const totalAmount = mappedItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const order: Order = {
      id: (crypto?.randomUUID?.() ?? `o_${Date.now()}`).toString(),
      userId,
      items: mappedItems,
      totalAmount,
      paymentMethod,
      receiptPdfUrl: '',
      status: 'Paid',
      createdAtUtc: new Date().toISOString()
    };

    const all = this.readLocal<Order>(this.ORDERS_KEY);
    all.unshift(order);
    this.writeLocal(this.ORDERS_KEY, all);
    return order;
  }

  private myOrdersLocal(): Order[] {
    const userId = this.currentUserId();
    return this.readLocal<Order>(this.ORDERS_KEY).filter(o => o.userId === userId);
  }
}

