export const config: Config = {
    question: 'What is windows?',
    searchIndex: 'gitpod',
};

export interface Config {
    question: string;
    searchIndex: 'wikipedia' | 'gitpod';
}
