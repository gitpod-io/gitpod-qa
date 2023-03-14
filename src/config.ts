export const config: Config = {
    question: 'What is windows?',
    searchIndex: 'wikipedia',
};

export interface Config {
    question: string;
    searchIndex: 'wikipedia';
}
