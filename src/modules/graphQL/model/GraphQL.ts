export interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

export type UserKeys = keyof User;

export interface PageParam {
    page?: number;
}