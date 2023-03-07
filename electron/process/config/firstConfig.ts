import { ConfigController } from './control';

interface _FirstConfig {
    recent: string[];
}

type FirstConfig = DeepPartial<_FirstConfig>;

export const first = new ConfigController<FirstConfig>('firstConfig.json', {});
