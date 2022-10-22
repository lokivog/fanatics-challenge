/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-var-requires */
import axios from 'axios';
import { Logger } from 'winston';
import { createDefaultLogger } from '../../../..';
import { ConfigurationService } from '../../../../config/ConfigurationService';
import { User } from '../../model/GraphQL';
import { GraphQLService } from '../GraphQLService';


const getUsersSuccessResponse = require('./data/getUsersSuccessResponse.json');
const getUserSuccessResponse = require('./data/getUserSuccessResponse.json');
const getUserErrorResponse = require('./data/getUserSuccessResponse.json');
const updateUserSuccessResponse = require('./data/updateUserSuccessResponse.json');
const sortedUsersByName = require('./data/sortedUsersByName.json');
const sortedUsersById = require('./data/sortedUsersById.json');

jest.mock('axios', () => jest.fn());

describe('GraphQLService tests', () => {
    let service: GraphQLService;
    let logger: Logger;

    beforeAll(() => {
        logger = createDefaultLogger();
        const config: ConfigurationService = new ConfigurationService();
        service = new GraphQLService(logger, config.getConfiguration());
    });


    afterEach(() => {
        jest.restoreAllMocks();
    });


    it('should get users on page 3', async () => {
        const mRes = { status: 200, data: getUsersSuccessResponse };
        (axios as unknown as jest.Mock).mockResolvedValueOnce(mRes);

        const userResponse = await service.getUsersAtPage(3);

        expect(userResponse.length).toEqual(10);
    });

    it('should get user', async () => {
        const mRes = { status: 200, data: getUserSuccessResponse };
        (axios as unknown as jest.Mock).mockResolvedValueOnce(mRes);

        const userResponse = await service.getUser(3718);

        expect(userResponse?.name).toEqual('Bala Mehrotra II');
    });

    it('should get user not return', async () => {
        const mRes = { status: 404, data: getUserErrorResponse };
        (axios as unknown as jest.Mock).mockResolvedValueOnce(mRes);

        const userResponse = await service.getUser(5555);

        expect(userResponse).toBeNull;
    });

    it('should delete user', async () => {
        const mRes = { status: 204 };
        (axios as unknown as jest.Mock).mockResolvedValueOnce(mRes);

        const userResponse = await service.deleteUser(3717);

        expect(userResponse).toBeTruthy;
    });

    it('should update user', async () => {
        const updateUser: Partial<User> = { 'name': 'Alex Smith', id: 3780 };

        const mRes = { status: 200, data: updateUserSuccessResponse };
        (axios as unknown as jest.Mock).mockResolvedValueOnce(mRes);

        const response = await service.updateUser(updateUser);

        expect(response?.name).toEqual('Alex Smith');
    });

    it('should sort users', () => {
        const users: User[] = getUsersSuccessResponse;

        //test sort by user name
        const response = service.sortUsers(users, "name");
        expect(response).toEqual(sortedUsersByName);

        //test sort by user id
        const response2 = service.sortUsers(users, "id");
        expect(response2).toEqual(sortedUsersById);
    });


});
