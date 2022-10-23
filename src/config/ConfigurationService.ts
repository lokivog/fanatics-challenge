import nconf, { Provider } from 'nconf';
import path from 'path';


export class ConfigurationService {
    private config: Provider;
    constructor() {

        this.config = nconf
            .file('user', path.join(__dirname, '../..', '', `.env`))
            .file('global', path.join(__dirname, '..', 'env', `default.json`));

    }

    public getConfiguration(): Provider {
        return this.config;
    }

}
