/* eslint-disable @typescript-eslint/no-explicit-any */
'use strict';

import { Logger } from "winston";

/**
 * <b>Error Handler for Axios calls<b/><br/>
 *
 * @module axiosErrorHandler
 */
export class AxiosErrorHandler {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static handleError(axiosErr: any, endpoint: string, logger: Logger) {
        let errorMessage = '';
        if (axiosErr.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx

            try {
                errorMessage = axiosErr.response.data ? JSON.stringify(axiosErr.response.data) : axiosErr.response.statusText;
                logger.error(
                    'Error calling ' +
                    endpoint +
                    ' responseCode: ' +
                    axiosErr.response.status +
                    ' - ' +
                    errorMessage
                );
            } catch (e: any) {
                logger.error('Error trying to stingify response on: ');
                logger.error(e);
                logger.error(axiosErr);
            }
        } else if (axiosErr.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            errorMessage = 'The request was made but no response was received' + endpoint;
            logger.error(errorMessage);
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = 'Something happened in setting up the request that triggered an Error';
            logger.error(errorMessage);
            logger.error(axiosErr.message);
        }
        return errorMessage;
    }
}
