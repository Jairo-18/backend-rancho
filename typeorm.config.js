import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config, ENV_FILE } from './src/config.js';
import { buildDataSourceOptions } from './src/shared/utils/typeorm.options.js';
try {
    process.loadEnvFile(ENV_FILE);
}
catch {
}
export const appConfig = config();
export default new DataSource(buildDataSourceOptions(appConfig.db));
//# sourceMappingURL=typeorm.config.js.map