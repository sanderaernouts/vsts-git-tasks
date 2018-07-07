"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vso-node-api");
function getEnv(name) {
    let val = process.env[name];
    if (!val) {
        console.error(name + ' environment variable is not set');
        process.exit(1);
    }
    return val;
}
exports.getEnv = getEnv;
function getWebApi() {
    return __awaiter(this, void 0, void 0, function* () {
        let serverUrl = getEnv('SYSTEM_TEAMFOUNDATIONCOLLECTIONURI');
        console.log("connecting to VSTS web API's on server: \"" + serverUrl + "\"");
        return yield this.getApi(serverUrl);
    });
}
exports.getWebApi = getWebApi;
function getApi(serverUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let token = getEnv('SYSTEM_ACCESSTOKEN');
                let authHandler = vm.getPersonalAccessTokenHandler(token);
                let option = undefined;
                // The following sample is for testing proxy
                // option = {
                //     proxy: {
                //         proxyUrl: "http://127.0.0.1:8888"
                //         // proxyUsername: "1",
                //         // proxyPassword: "1",
                //         // proxyBypassHosts: [
                //         //     "github\.com"
                //         // ],
                //     },
                //     ignoreSslError: true
                // };
                // The following sample is for testing cert
                // option = {
                //     cert: {
                //         caFile: "E:\\certutil\\doctest\\ca2.pem",
                //         certFile: "E:\\certutil\\doctest\\client-cert2.pem",
                //         keyFile: "E:\\certutil\\doctest\\client-cert-key2.pem",
                //         passphrase: "test123",
                //     },
                // };
                let vsts = new vm.WebApi(serverUrl, authHandler, option);
                let connData = yield vsts.connect();
                console.log('authenticated as user: "' + connData.authenticatedUser.providerDisplayName + '"');
                resolve(vsts);
            }
            catch (err) {
                reject(err);
            }
        }));
    });
}
exports.getApi = getApi;
function getProject() {
    return getEnv('SYSTEM_TEAMPROJECT');
}
exports.getProject = getProject;
function getRepositoryProvider() {
    return getEnv('BUILD_REPOSITORY_PROVIDER');
}
exports.getRepositoryProvider = getRepositoryProvider;
function getRepositoryName() {
    return getEnv('BUILD_REPOSITORY_NAME');
}
exports.getRepositoryName = getRepositoryName;
function banner(title) {
    console.log('=======================================');
    console.log('\t' + title);
    console.log('=======================================');
}
exports.banner = banner;
function heading(title) {
    console.log();
    console.log('> ' + title);
}
exports.heading = heading;
