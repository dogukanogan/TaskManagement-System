export interface Category {
    id: string;
    name: string;
    description?: string;
    color: string;
    createdAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    description?: string;
    color: string;
}