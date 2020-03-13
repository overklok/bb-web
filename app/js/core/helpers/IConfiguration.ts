export interface ConfigurationConstructor {
    new (config: object): IConfiguration;
}

export interface IConfiguration {
    preprocess(): void
}