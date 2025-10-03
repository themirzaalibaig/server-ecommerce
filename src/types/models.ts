export interface BaseModel {
  createdAt: Date;
  updatedAt: Date;
}

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum Size {
  XS = 'xs',
  S = 's',
  M = 'm',
  L = 'l',
  XL = 'xl',
}

export interface Image {
  url: string;
  public_id: string;
}

export interface User extends BaseModel {
  username: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  isActive: boolean;
  image: Image;
}

export interface Category extends BaseModel {
  name: string;
  slug: string;
  description: string;
  image: Image;
}

export interface Product extends BaseModel {
  name: string;
  slug: string;
  description: string;
  price: number;
  tags: string[];
  color: string[];
  thumbnail: Image;
  images: Image[];
  stock: number;
  category: Category;
  size: Size[];
  inStock: boolean;
  totalStock: number;
  totalSold: number;
}
