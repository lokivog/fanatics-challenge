/** Model class for defining the data structures for accessing the gorest service */

/**
 * User object returned by getUser or getUsers requests
 */
export interface User {
    id: number;
    name: string;
    email: string;
    gender: string;
    status: string;
}

export interface Pagination {
    totalResults: number;
    totalPages: number;
    currentPage: number;
    resultsPerPage: number;
}

export interface UserResults {
    users: User[],
    pagination?: Pagination
}

export type UserKeys = keyof User;


type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>

/** Validates the max results per page is in the range of 1-100 */
export type PAGE_RANGE = Range<1, 101>

export interface PageParam {
    page?: number;
    per_page?: PAGE_RANGE
}