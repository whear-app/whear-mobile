import { create } from 'zustand';
import { ClosetItem, ItemCategory } from '../models';

export type ClothSource = 'manual' | 'shopee' | 'tiktokshop' | 'lazada' | 'other';

export interface ClothStorageItem extends ClosetItem {
  name?: string;
  source: ClothSource;
  sourceOrderId?: string;
  brand?: string;
  size?: string;
  material?: string[];
  season?: string[];
  style?: string[];
  purchaseDate?: string;
  price?: number;
}

interface ClothesStorageState {
  items: ClothStorageItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: (userId: string) => Promise<void>;
  addItem: (item: Omit<ClothStorageItem, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateItem: (itemId: string, updates: Partial<ClothStorageItem>) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  syncFromEcommerce: (userId: string, platform: 'shopee' | 'tiktokshop' | 'lazada', orders: any[]) => Promise<void>;
}

export const useClothesStorageStore = create<ClothesStorageState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  fetchItems: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Mock data for now - replace with actual API call
      const mockItems: ClothStorageItem[] = [
        {
          id: '1',
          userId,
          imageUri: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop',
          category: 'top',
          colors: ['white', 'blue'],
          tags: ['casual', 'summer'],
          name: 'White T-Shirt',
          source: 'manual',
          brand: 'Nike',
          size: 'M',
          material: ['cotton'],
          season: ['summer', 'spring'],
          style: ['casual'],
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId,
          imageUri: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop',
          category: 'bottom',
          colors: ['black'],
          tags: ['formal'],
          name: 'Black Jeans',
          source: 'shopee',
          sourceOrderId: 'SP123456',
          brand: 'Levi\'s',
          size: '32',
          material: ['denim'],
          season: ['all'],
          style: ['casual', 'formal'],
          purchaseDate: '2024-01-15',
          price: 29.99,
          createdAt: new Date().toISOString(),
        },
      ];
      set({ items: mockItems, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addItem: async (item) => {
    set({ isLoading: true, error: null });
    try {
      const newItem: ClothStorageItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ items: [...state.items, newItem], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  updateItem: async (itemId: string, updates: Partial<ClothStorageItem>) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        items: state.items.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  deleteItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        items: state.items.filter((item) => item.id !== itemId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  syncFromEcommerce: async (userId: string, platform: 'shopee' | 'tiktokshop' | 'lazada', orders: any[]) => {
    set({ isLoading: true, error: null });
    try {
      // Mock sync - replace with actual API call
      const syncedItems: ClothStorageItem[] = orders.map((order, index) => ({
        id: `${platform}-${Date.now()}-${index}`,
        userId,
        imageUri: order.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=600&fit=crop',
        category: order.category || 'other',
        colors: order.colors || [],
        tags: order.tags || [],
        name: order.name || 'Unknown Item',
        source: platform,
        sourceOrderId: order.orderId,
        brand: order.brand,
        size: order.size,
        material: order.material || [],
        season: order.season || [],
        style: order.style || [],
        purchaseDate: order.purchaseDate,
        price: order.price,
        createdAt: new Date().toISOString(),
      }));
      set((state) => ({ items: [...state.items, ...syncedItems], isLoading: false }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));

