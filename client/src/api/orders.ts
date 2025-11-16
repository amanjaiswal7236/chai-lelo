import api from './client';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  isVeg: boolean;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
}

export interface Order {
  _id: string;
  user: string;
  userName: string;
  userPhone: string;
  location: string;
  items: OrderItem[];
  mealType: 'lunch' | 'dinner' | 'dinner-meals';
  orderDate: string;
  totalAmount: number;
  paymentStatus: boolean;
  paymentId?: string;
  packed: boolean;
  delivered: boolean;
  status: 'pending' | 'accepted' | 'packed' | 'in-transit' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const createOrder = async (data: {
  items: OrderItem[];
  mealType: 'lunch' | 'dinner' | 'dinner-meals';
  location: string;
}): Promise<Order> => {
  const response = await api.post('/orders', data);
  return response.data.order;
};

export const getCurrentOrder = async (): Promise<Order | null> => {
  const response = await api.get('/orders/current');
  return response.data;
};

export const getOrderHistory = async (params?: {
  date?: string;
  mealType?: string;
  status?: string;
}): Promise<Order[]> => {
  const response = await api.get('/orders/history', { params });
  return response.data;
};

export const updatePaymentStatus = async (
  orderId: string,
  paymentId: string,
  paymentStatus: boolean
): Promise<Order> => {
  const response = await api.patch(`/orders/${orderId}/payment`, {
    paymentId,
    paymentStatus,
  });
  return response.data.order;
};

