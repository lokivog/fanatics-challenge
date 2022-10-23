import nconf, { Provider } from 'nconf';
import path from 'path';


export class ConfigurationService {
    private config: Provider;
    constructor() {
        //normally would load a config file that is not checked into source control that contains any keys or passwords into this config
        this.config = nconf
            .file('global', path.join(__dirname, '..', 'env', `default.json`));
    }

    public getConfiguration(): Provider {
        return this.config;
    }

}
