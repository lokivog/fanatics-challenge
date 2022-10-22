import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { Provider } from "nconf";
import { Logger } from "winston";
import { AxiosErrorHandler } from "../../../logging/AxiosErrorHandler";
import { PageParam, User, UserKeys } from "../model/GraphQL";

const USERS_ENDPOINT = "/public/v2/users";
const DEFAULT_SORT_BY_ID = 'id';

/**
 * Service class for accessing GraphQLService
 */
export class GraphQLService {

    private logger: Logger;
    private config: Provider;
    private url: string;
    private accessToken: string;

    /**
     * init GraphQLService
     * @param logger winston logger
     * @param config ConfigurationService
     */
    constructor(
        logger: Logger,
        config: Provider
    ) {
        this.logger = logger;
        this.config = config
        this.url = config.get("url");
        this.accessToken = config.get("accessToken");
    }

    /**
     * 
     * @param pUsers [] of type User
     * @param pSortyBy key must be one of 'id' | 'name' | 'email' | 'gender' | 'status' 
     * @returns 
     */
    public sortUsers(pUsers: User[], pSortyBy: UserKeys): User[] {
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

    public async getUser(pId: number): Promise<User | null> {

        let user: User | null = null;
        const options: AxiosRequestConfig = {
            method: 'GET',
            url: `${this.url}/${USERS_ENDPOINT}/${pId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            }
        }
        this.logger.debug(`getUser request: ${JSON.stringify(options)}`);
        try {
            await axios<User>(options).then(response => {
                if (response.status === 200 && response.data) {
                    this.logger.debug(`getUser response: %s %s`, pId, response.data);
                    user = response.data;
                } else {
                    this.logger.error(`getUser failed with status: ${response.status}`);
                }

            });
        } catch (error: unknown | AxiosError) {
            if (error instanceof AxiosError) {
                // Access to config, request, and response
                AxiosErrorHandler.handleError(error, `getUser ${pId}`, this.logger);
            } else {
                this.logger.error(`getUser ${pId} %s`, error);
            }
        }

        return user;
    }

    public async getUsersAtPage(pageNumber: number): Promise<User[]> {
        const params = { page: pageNumber };
        const users: User[] = await this.getUsers(params);
        return users;
    }


    public async getUsers(pParams: PageParam): Promise<User[]> {

        let users: User[] = [];
        const options: AxiosRequestConfig = {
            method: 'GET',
            url: `${this.url}/${USERS_ENDPOINT}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            params: pParams
        }
        this.logger.debug(`getUsers request: ${JSON.stringify(options)}`);
        try {
            await axios<User[]>(options).then(response => {
                if (response.status === 200 && response.data) {
                    this.logger.debug('getUsers response %s', JSON.stringify(response.data));
                    users = response.data;
                } else {
                    if (response && response.status) {
                        this.logger.error(`getUsers failed with status: ${response.status}`);
                    } else {
                        this.logger.error(`getUsers failed with response: ${response}`);
                    }
                }

            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, 'getUsers', this.logger);
        }

        return users;
    }

    public async updateUser(pUserUpdate: Partial<User>): Promise<User | null> {

        let user: Partial<User> | null = null;

        const options: AxiosRequestConfig = {
            method: 'PUT',
            url: `${this.url}/${USERS_ENDPOINT}/${pUserUpdate.id}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            },
            data: pUserUpdate
        }
        this.logger.debug(`updateUser request ${JSON.stringify(options)}`);
        try {
            await axios<User>(options).then(response => {
                if (response.status === 200 && response.data) {
                    this.logger.debug(`updateUser response for user ${pUserUpdate.id} %s`, response.data);
                    user = response.data;

                } else {
                    this.logger.error(`updateUser failed with status: ${response.status}`);
                }

            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, `updateUser ${pUserUpdate.id}`, this.logger);
        }

        return user;
    }

    public async deleteUser(pUserId: number): Promise<boolean> {

        let success = false;

        const options: AxiosRequestConfig = {
            method: 'DELETE',
            url: `${this.url}/${USERS_ENDPOINT}/${pUserId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.accessToken}`
            }
        }
        this.logger.debug(`deleteUser request ${JSON.stringify(options)}`);
        try {
            await axios<User>(options).then(response => {
                if (response.status === 204) {
                    success = true;
                } else {
                    this.logger.error(`deleteUser failed with status: ${response.status} ${response.data}`);
                }
            });
        } catch (error: unknown | AxiosError) {
            AxiosErrorHandler.handleError(error, `deleteUser ${pUserId}`, this.logger);
        }

        return success;
    }
}