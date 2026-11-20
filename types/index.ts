export type UserRole = "customer" | "owner" | "admin";

export type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
};

export type EquipmentItem = {
  _id: string;
  name: string;
  category: string;
  description: string;
  pricePerDay: number;
  location: string;
  images: string[];
  ownerId?: string | { _id: string; name: string; email: string };
  isApproved?: boolean;
  approvalStatus?: "pending" | "approved" | "rejected";
  rating?: number;
  totalReviews?: number;
  specifications?: Record<string, string>;
  createdAt?: string;
};

export type FavoriteEquipment = {
  _id: string;
  name: string;
  category: string;
  pricePerDay: number;
  location: string;
  images: string[];
  rating?: number;
  totalReviews?: number;
};

export type FavoriteEntry = {
  _id: string;
  userId: string;
  equipmentId: FavoriteEquipment | string;
  createdAt?: string;
};

