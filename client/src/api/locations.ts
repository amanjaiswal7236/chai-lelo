import api from './client';

export interface Location {
  _id: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export const getLocations = async (): Promise<Location[]> => {
  const response = await api.get('/locations');
  return response.data;
};

