import * as vm from 'vso-node-api';
export declare function getWebApi(): Promise<vm.WebApi>;
export declare function getApi(serverUrl: string): Promise<vm.WebApi>;
export declare function getProject(): string;
export declare function banner(title: string): void;
export declare function heading(title: string): void;
