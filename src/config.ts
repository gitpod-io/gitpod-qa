export const config: Config = {
    searchIndex: 'gitpod',
};

export interface Config {
    searchIndex: 'wikipedia' | 'gitpod';
}
