"use strict";
import { Logger } from 'winston';
import { ConfigurationService } from './config/ConfigurationService';
import { createDefaultLogger } from './logging/LoggingService';
import { User } from "./modules/goRest/model/GoRest";
import { GoRestService } from './modules/goRest/service/GoRestService';


const logger: Logger = createDefaultLogger();
const config: ConfigurationService = new ConfigurationService();
const service: GoRestService = new GoRestService(logger, config.getConfiguration());


const NON_EXISTENT_USER = 5555;

async function fantaticsCodingChallenge() {
    //logger.info("fantaticsCodingChallenge");
    // 1. Retrieve page 3 of the list of all users.
    const userResults = await service.getUsersAtPage(3);
    if (userResults.users.length > 0) {
        //2. Using a logger, log the total number of pages from the previous request.
        logger.info(`2. Total number of pages retrieved: ${userResults.pagination?.totalPages}`);

        //3. Sort the retrieved user list by name.
        service.sortUsers(userResults.users, "name");

        //4. After sorting, log the name of the last user.
        const lastUser = userResults.users.pop();
        logger.info(`4. Last user in array: ${lastUser?.name}`);

        //5. Update that user's name to a new value and use the correct http method to save it.
        const updateUser: Partial<User> = { 'name': 'Alex Smith', id: lastUser?.id };
        const updateUserResult = await service.updateUser(updateUser);

        if (updateUserResult) {
            logger.info(`5. Updated user ${JSON.stringify(updateUserResult)}`);
            //6. Delete that user.
            const deleteSuccess = await service.deleteUser(updateUserResult.id);
            logger.info(`6. Delete user ${updateUserResult.name} success: ${deleteSuccess}`);

            //7. Attempt to retrieve a nonexistent user with ID 5555. Log the resulting http response code.
            await service.getUser(NON_EXISTENT_USER);
            //logger.warn(`Get user with id ${NON_EXISTENT_USER} %s`, getUser);
        }
    }
}

fantaticsCodingChallenge();
