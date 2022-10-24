/* eslint-disable @typescript-eslint/no-var-requires */

import axios from 'axios';
import { Logger } from 'winston';
import MockAdapter from "axios-mock-adapter";
import { ConfigurationService } from '../../../../config/ConfigurationService';
import { User } from '../../model/GoRest';
import { GoRestService } from '../GoRestService';

import { createDefaultLogger } from '../../../../logging/LoggingService';

//CONSTANTS
const getUsersSuccessResponse = require('./data/getUsersSuccessResponse.json');
const getUserSuccessResponse = require('./data/getUserSuccessResponse.json');
const updateUserSuccessResponse = require('./data/updateUserSuccessResponse.json');
const sortedUsersByName = require('./data/sortedUsersByName.json');
const sortedUsersById = require('./data/sortedUsersById.json');


describe('GoRestService tests', () => {
    let service: GoRestService;
    let logger: Logger;
    let mock: MockAdapter;

    beforeAll(() => {
        logger = createDefaultLogger();
        const config: ConfigurationService = new ConfigurationService();
        service = new GoRestService(logger, config.getConfiguration());
        mock = new MockAdapter(axios);
    });

    afterEach(() => {
        mock.reset();
    });

    it('should get users on page 3', async () => {
        mock.onAny().reply(200, getUsersSuccessResponse);

        const userResponse = await service.getUsersAtPage(3);
        expect(userResponse.users.length).toEqual(10);
    });

    it('should get pagniation information', async () => {
        const mRes = {
            status: 200, data: getUsersSuccessResponse, headers: {
                'x-pagination-total': 3700,
                'x-pagination-limit': 10,
                'x-pagination-page': 3,
                'x-pagination-pages': 370
            }
        };

        mock.onAny().reply(mRes.status, mRes.data, mRes.headers);

        const userResponse = await service.getUsersAtPage(3);
        expect(userResponse.pagination?.totalResults).toEqual("3700");
        expect(userResponse.pagination?.totalPages).toEqual("370");
        expect(userResponse.pagination?.currentPage).toEqual("3");
        expect(userResponse.pagination?.resultsPerPage).toEqual("10");
    });

    it('should get user', async () => {
        const mRes = { status: 200, data: getUserSuccessResponse };
        mock.onAny().reply(mRes.status, mRes.data);

        const userResponse = await service.getUser(3718);

        expect(userResponse?.name).toEqual('Bala Mehrotra II');
    });

    it('should get users not return data', async () => {
        const mRes = { status: 200, data: [] };
        mock.onAny().reply(mRes.status, mRes.data);

        const userResponse = await service.getUsers({ 'page': 5000 });

        expect(userResponse.users.length).toEqual(0);
    });

    it('should get users exceed request limit', async () => {
        const mRes = { status: 429, data: [] };
        mock.onAny().reply(mRes.status, mRes.data);

        const userResponse = await service.getUsers();

        expect(userResponse.users.length).toEqual(0);
    });

    it('should get user not return', async () => {
        const mRes = {
            status: 404,
            statusText: 'Resource not found',
            data: {
                message: 'Resource not found'
            }
        };

        mock.onAny().reply(mRes.status, mRes.data);

        const userResponse = await service.getUser(5555);

        expect(userResponse).toBeNull;
    });

    it('should delete user', async () => {
        mock.onAny().reply(204);

        const userResponse = await service.deleteUser(3717);

        expect(userResponse).toEqual(true);
    });

    it('should delete user fail', async () => {
        const mRes = {
            status: 404,
            data: {
                message: 'Resource not found'
            }
        };
        mock.onAny().reply(mRes.status, mRes.data);

        const userResponse = await service.deleteUser(3717);
        expect(userResponse).toEqual(false);
    });

    it('should update user', async () => {
        const updateUser: Partial<User> = { 'name': 'Alex Smith', id: 3780 };

        const mRes = { status: 200, data: updateUserSuccessResponse };
        mock.onAny().reply(mRes.status, mRes.data);

        const response = await service.updateUser(updateUser);

        expect(response?.name).toEqual('Alex Smith');
    });

    it('should update user fail', async () => {
        const updateUser: Partial<User> = { 'name': 'Alex Smith', id: 3780 };

        const mRes = {
            status: 404, data: {
                message: 'Resource not found'
            }
        };
        mock.onAny().reply(mRes.status, mRes.data);

        const response = await service.updateUser(updateUser);

        expect(response).toBeNull();
    });

    it('should sort users', () => {
        const users: User[] = getUsersSuccessResponse;

        //test sort by user name
        const response = service.sortUsers(users, "name");
        expect(response).toEqual(sortedUsersByName);

        //test sort by user id
        const response2 = service.sortUsers(users, "id");
        expect(response2).toEqual(sortedUsersById);

        //test an empty array does not fail
        const response3 = service.sortUsers([], "id");
        expect(response3.length).toEqual(0);

        //test sort user with no sort param so results in default sort by id
        const response4 = service.sortUsers(users);
        expect(response4).toEqual(sortedUsersById);
    });


});
