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
const cm = require("./common");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            var provider = cm.getRepositoryProvider();
            if (provider.indexOf("Git") < 0) {
                throw 'detected a repository provider that is not Git. Provider "' + provider + '" is not supported.';
            }
            let vsts = yield cm.getWebApi();
            let gitApi = yield vsts.getGitApi();
            const project = cm.getProject();
            const repositoryName = cm.getRepositoryName();
            console.log(`searching for repository "${repositoryName}" in project "${project}"`);
            const respositories = yield gitApi.getRepositories(project);
            if (respositories) {
                console.log(`found ${respositories.length} respositories`);
            }
            var repository = respositories.filter(repository => {
                return repository.name == repositoryName;
            })[0];
            console.log(`found repository "${repository.name}" with id "${repository.id}"`);
            var pullRequest = {};
            pullRequest.sourceRefName = "refs/heads/test";
            pullRequest.targetRefName = "refs/heads/master";
            pullRequest.title = "Automatic pull request from test to master";
            var result = yield gitApi.createPullRequest(pullRequest, repository.id, project, true);
            console.log(`created pull request with id ${result.pullRequestId}`);
        }
        catch (err) {
            console.error('Error: ' + err.stack);
        }
    });
}
exports.run = run;
