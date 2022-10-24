import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Provider } from 'nconf';
import { Logger } from 'winston';
import { AxiosErrorHandler } from '../../../logging/AxiosErrorHandler';
import { PageParam, PAGE_RANGE, User, UserKeys, UserResults } from '../model/GoRest';

//CONSTANTS
const USERS_ENDPOINT = '/public/v2/users';
const DEFAULT_SORT_BY_ID = 'id';
const DEFAULT_RESULTS_PER_PAGE = 10;
const HEADER_X_PAGINATION_TOTAL = 'x-pagination-total';
const HEADER_X_PAGINATION_PAGES = 'x-pagination-pages';
const HEADER_X_PAGINATION_PAGE = 'x-pagination-page';
const HEADER_X_PAGINATION_LIMIT = 'x-pagination-limit';

/**
 * Service class for accessing GoRest gorest service.
 */
export class GoRestService {
    private logger: Logger;
    private config: Provider;
    private url: string;
    private accessToken: string;
    private requestConfig: AxiosRequestConfig;

    /**
     * init GoRestService
     * @param logger winston logger
     * @param config ConfigurationService
     */
    constructor(logger: Logger, config: Provider) {
        this.logger = logger;
        this.config = config;
        this.url = config.get('url');
        this.accessToken = config.get('accessToken');
        this.requestConfig = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`
            },
            url: `${this.url}/${USERS_ENDPOINT}`
        };
    }

    /**
     * Sorts an array of users.
     * @param pUsers [] of type User
     * @param pSortyBy key must be one of 'id' | 'name' | 'email' | 'gender' | 'status'
     * @returns
     */
    public sortUsers(pUsers: User[], pSortyBy?: UserKeys): User[] {
        if (pUsers && pUsers.length > 0) {
            const sortBy = pSortyBy ? pSortyBy : DEFAULT_SORT_BY_ID;
            pUsers.sort((u1, u2) => {
                if (u1[sortBy] < u2[sortBy]) {
                    return -1;
                }
                if (u1[sortBy] > u2[sortBy]) {
                    return 1;
                }
                return 0;
            });
            return pUsers;
        }
        return [];
    }

    /**
     * Gets a user by specified id.
     * @param pId id of the user to retrieve
     * @returns User if found; otherwise null
     */
    public async getUser(pId: number): Promise<User | null> {
        let user: User | null = null;
        const options = { ...this.requestConfig, url: `${this.requestConfig.url}/${pId}` };

        this.logger.debug(`getUser request: ${JSON.stringify(options)}`);
        try {
            await axios<User>(options).then(response => {
                if (response.status === 200 && response.data) {
                    this.logger.debug(`getUser response: %s %s`, pId, response.data);
                    user = response.data;
                }
            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, `getUser ${pId}`, this.logger);
        }

        return user;
    }

    /**
     * Gets a list of users by page number. Optional resultsPerPage.
     * @param pPageNumber current page number to retreive
     * @param pResultsPerPage (optional) max results per page (max 100 results per page)
     * @returns
     */
    public async getUsersAtPage(pPageNumber: number, pResultsPerPage?: PAGE_RANGE): Promise<UserResults> {
        const resultsPerPage = pResultsPerPage ? pResultsPerPage : DEFAULT_RESULTS_PER_PAGE;
        const params = { page: pPageNumber, per_page: resultsPerPage };
        const userResults: UserResults = await this.getUsers(params);
        return userResults;
    }

    /**
     * Get a list of users.
     * @param pParams PageParam (optional), can be one of: page | per_page
     * @returns
     */
    public async getUsers(pParams?: PageParam): Promise<UserResults> {
        const userResults: UserResults = {
            users: []
        };
        const options = { ...this.requestConfig, params: pParams };

        this.logger.debug(`getUsers request: ${JSON.stringify(options)}`);
        try {
            await axios<User[]>(options).then(response => {
                if (response.status === 200 && response.data && response.data.length > 0) {
                    this.logger.debug('getUsers response headers %s', JSON.stringify(response.headers));
                    this.logger.debug('getUsers response %s', JSON.stringify(response.data));
                    userResults.users = response.data;
                    userResults.pagination = this.buildPagination(response.headers);
                } else {
                    const params = pParams ? JSON.stringify(pParams) : '';
                    this.logger.warn(`getUsers return 0 results: ${options.url}?${params}`);
                }
            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, 'getUsers', this.logger);
        }
        return userResults;
    }

    /**
     * Updates a user.
     * @param pUserUpdate the User to update
     * @returns User the updated user if successfull; otherwise null if failed
     */
    public async updateUser(pUserUpdate: Partial<User>): Promise<User | null> {
        let user: Partial<User> | null = null;

        const options = {
            ...this.requestConfig,
            method: 'PUT',
            url: `${this.requestConfig.url}/${pUserUpdate.id}`,
            data: pUserUpdate
        };
        this.logger.debug(`updateUser request ${JSON.stringify(options)}`);

        try {
            await axios<User>(options).then(response => {
                if (response.status === 200 && response.data) {
                    this.logger.debug(`updateUser response for user ${pUserUpdate.id} %s`, response.data);
                    user = response.data;
                }
            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, `updateUser ${pUserUpdate.id}`, this.logger);
        }

        return user;
    }

    /**
     * Deletes a user.
     * @param pUserId user id to delete
     * @returns boolean if successful or not
     */
    public async deleteUser(pUserId: number): Promise<boolean> {
        let success = false;

        const options = {
            ...this.requestConfig,
            method: 'DELETE',
            url: `${this.requestConfig.url}/${pUserId}`
        };

        this.logger.debug(`deleteUser request ${JSON.stringify(options)}`);
        try {
            await axios<User>(options).then(response => {
                if (response.status === 204) {
                    success = true;
                }
            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, `deleteUser ${pUserId}`, this.logger);
        }

        return success;
    }

    /**
     * Builds a Pagination Object from a response header.
     * @param response http response
     * @returns Pagination
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private buildPagination(pResponse: any) {
        return {
            totalResults: pResponse[HEADER_X_PAGINATION_TOTAL],
            totalPages: pResponse[HEADER_X_PAGINATION_PAGES],
            currentPage: pResponse[HEADER_X_PAGINATION_PAGE],
            resultsPerPage: pResponse[HEADER_X_PAGINATION_LIMIT]
        };
    }
}
