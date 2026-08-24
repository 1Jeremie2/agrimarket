// Client API centralisé — un seul point pour parler au backend NestJS

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null; // rendu serveur : pas de session
  return localStorage.getItem('auth_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    cache: 'no-store', // toujours des données fraîches — évite le cache par défaut de Next.js
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erreur inconnue' }));
    throw new Error(error.message ?? `Erreur ${res.status}`);
  }

  // Les routes DELETE/PATCH peuvent renvoyer un corps vide
  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ accessToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },
  users: {
    register: (data: { email: string; password: string; role: string; phone?: string }) =>
      request<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  producers: {
    create: (data: any) => request<any>('/producers', { method: 'POST', body: JSON.stringify(data) }),
    list: () => request<any[]>('/producers'),
    get: (id: string) => request<any>(`/producers/${id}`),
    pending: () => request<any[]>('/producers/pending'),
    validate: (id: string) => request<any>(`/producers/${id}/validate`, { method: 'PATCH' }),
    suspend: (id: string) => request<any>(`/producers/${id}/suspend`, { method: 'PATCH' }),
  },
  products: {
    list: (params?: { categoryId?: string; producerId?: string }) => {
      const qs = new URLSearchParams(params as Record<string, string>).toString();
      return request<any[]>(`/products${qs ? `?${qs}` : ''}`);
    },
    get: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    remove: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    create: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
    mine: () => request<any[]>('/orders/mine'),
    get: (id: string) => request<any>(`/orders/${id}`),
    forMyProducerAccount: () => request<any[]>('/orders/producer/mine'),
    awaitingPayout: () => request<any[]>('/orders/admin/awaiting-payout'),
    awaitingPaymentConfirmation: () => request<any[]>('/orders/admin/awaiting-payment-confirmation'),
    attachPaymentProof: (id: string, proofUrl: string) =>
      request<any>(`/orders/${id}/payment-proof`, { method: 'PATCH', body: JSON.stringify({ proofUrl }) }),
    confirmPayment: (id: string) => request<any>(`/orders/${id}/confirm-payment`, { method: 'PATCH' }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    markPayoutDone: (id: string, reference: string) =>
      request<any>(`/orders/${id}/payout`, { method: 'PATCH', body: JSON.stringify({ reference }) }),
  },
  platformAccounts: {
    listActive: () => request<any[]>('/platform-accounts/active'),
    listAll: () => request<any[]>('/platform-accounts'),
    create: (data: { operator: string; phoneNumber: string; accountName: string }) =>
      request<any>('/platform-accounts', { method: 'POST', body: JSON.stringify(data) }),
    deactivate: (id: string) => request<any>(`/platform-accounts/${id}/deactivate`, { method: 'PATCH' }),
    activate: (id: string) => request<any>(`/platform-accounts/${id}/activate`, { method: 'PATCH' }),
  },
  categories: {
    list: () => request<any[]>('/categories'),
  },
  reviews: {
    create: (data: { orderId: string; rating: number; comment?: string }) =>
      request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  heroImages: {
    listActive: () => request<any[]>('/hero-images/active'),
    listAll: () => request<any[]>('/hero-images'),
    create: (data: { imageUrl: string; altText?: string; displayOrder?: number }) =>
      request<any>('/hero-images', { method: 'POST', body: JSON.stringify(data) }),
    deactivate: (id: string) => request<any>(`/hero-images/${id}/deactivate`, { method: 'PATCH' }),
    activate: (id: string) => request<any>(`/hero-images/${id}/activate`, { method: 'PATCH' }),
    remove: (id: string) => request<void>(`/hero-images/${id}`, { method: 'DELETE' }),
  },
};
