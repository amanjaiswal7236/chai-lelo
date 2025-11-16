import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  itemId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isVeg: boolean;
  quantity: number;
  addOns?: Array<{
    name: string;
    price: number;
  }>;
}

interface CartState {
  items: CartItem[];
  mealType: 'lunch' | 'dinner' | 'dinner-meals' | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  addAddOn: (itemId: string, addOn: { name: string; price: number }) => void;
  removeAddOn: (itemId: string, addOnName: string) => void;
  setMealType: (type: 'lunch' | 'dinner' | 'dinner-meals' | null) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      mealType: null,
      addItem: (item) => {
        const existingItem = get().items.find((i) => i.itemId === item.itemId);
        if (existingItem) {
          set({
            items: get().items.map((i) =>
              i.itemId === item.itemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },
      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.itemId !== itemId) });
      },
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
        } else {
          set({
            items: get().items.map((i) =>
              i.itemId === itemId ? { ...i, quantity } : i
            ),
          });
        }
      },
      addAddOn: (itemId, addOn) => {
        set({
          items: get().items.map((i) =>
            i.itemId === itemId
              ? {
                  ...i,
                  addOns: [...(i.addOns || []), addOn],
                }
              : i
          ),
        });
      },
      removeAddOn: (itemId, addOnName) => {
        set({
          items: get().items.map((i) =>
            i.itemId === itemId
              ? {
                  ...i,
                  addOns: (i.addOns || []).filter((a) => a.name !== addOnName),
                }
              : i
          ),
        });
      },
      setMealType: (type) => set({ mealType: type }),
      clearCart: () => set({ items: [], mealType: null }),
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const itemTotal = item.price * item.quantity;
          const addOnsTotal = (item.addOns || []).reduce(
            (sum, addon) => sum + addon.price,
            0
          );
          return total + itemTotal + addOnsTotal;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

