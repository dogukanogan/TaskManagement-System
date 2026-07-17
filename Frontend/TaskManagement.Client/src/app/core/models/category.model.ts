export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
}
