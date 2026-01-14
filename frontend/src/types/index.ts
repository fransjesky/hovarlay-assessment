export interface Image {
  id: number;
  url: string;
  productId: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  rating: number;
  inStock: boolean;
  images: Image[];
  categories: Category[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  message: string;
  data: Product[];
  pagination: Pagination;
}

export interface ProductResponse {
  message: string;
  data: Product;
}

export interface LoginResponse {
  message: string;
  data: {
    id: number;
    email: string;
    token: string;
  };
}

export interface SearchParams {
  page?: number;
  pageSize?: number;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  category?: number[];
  sort?: "price" | "rating" | "created_at" | "relevance";
  method?: "asc" | "desc";
}
