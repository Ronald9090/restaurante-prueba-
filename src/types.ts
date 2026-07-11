export interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  categoryId: string;
  image: string;
  featured: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  promoPrice: number;
  image: string;
  startDate: string;
  endDate: string;
  active: boolean;
  productIds: string[]; // Associated products
}

export interface CartItem {
  id: string; // unique item id (can be productId + observations hash, or random)
  itemType: 'product' | 'promotion';
  itemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  observations: string;
}

export type OrderStatus =
  | 'Nuevo'
  | 'Confirmado'
  | 'En preparación'
  | 'Listo'
  | 'Listo para recoger'
  | 'En camino'
  | 'Entregado'
  | 'Cancelado'
  | 'Rechazado';

export interface Order {
  id: string;
  clientName: string;
  phone: string;
  type: 'delivery' | 'pickup';
  address: string;
  reference: string;
  paymentMethod: 'qr' | 'cash';
  observations: string;
  items: CartItem[];
  total: number;
  date: string;
  time: string;
  status: OrderStatus;
}

export type ReservationStatus =
  | 'Pendiente'
  | 'Confirmada'
  | 'Atendida'
  | 'Reprogramada'
  | 'Cancelada'
  | 'Rechazada';

export interface Reservation {
  id: string;
  clientName: string;
  phone: string;
  date: string;
  time: string;
  peopleCount: number;
  tableAssigned: string; // "Mesa 1" to "Mesa 6"
  comments: string;
  status: ReservationStatus;
}

export interface RestaurantConfig {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  deliveryCost: number;
  minOrder: number;
  prepTime: string;
  socialFacebook: string;
  socialInstagram: string;
  logo: string;
  heroImage: string;
  paymentMethods: string[];
  tablesCount: number;
  publicUrl?: string;
}
