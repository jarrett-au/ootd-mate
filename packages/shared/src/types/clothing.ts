export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  imageUrl: string;
  category: string;
  color: string | null;
  brand: string | null;
  size: string | null;
  season: string | null;
  tags: string | null; // JSON string array
  createdAt: Date;
  updatedAt: Date;
}

export interface ClothingItemInput {
  name: string;
  description?: string;
  imageUrl: string;
  category: string;
  color?: string;
  brand?: string;
  size?: string;
  season?: string;
  tags?: string[];
}
