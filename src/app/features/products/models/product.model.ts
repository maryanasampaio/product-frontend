export interface Product {
	name: string;
	description: string;
	price: number;
	images: string[] | null;
}

export interface ProductResponse {
	id: number;
	name: string;
	slug: string;
	description: string;
	price: number;
	images: string[] | string | null;
	createdAt: string;
	updatedAt: string;
}