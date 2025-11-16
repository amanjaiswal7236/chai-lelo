import api from './client';

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: 'lunch' | 'dinner' | 'dinner-meals';
  isVeg: boolean;
  price: number;
  subItems?: string[];
  isEnabled: boolean;
}

export interface MenuResponse {
  category: string;
  items: MenuItem[];
  deadline: {
    time: string;
    isLive: boolean;
  } | null;
}

export const getMenuByCategory = async (category: string): Promise<MenuResponse> => {
  const response = await api.get(`/menu/${category}`);
  return response.data;
};

export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  const response = await api.get('/menu');
  return response.data;
};

