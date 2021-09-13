import path = require("path");

import * as azdev from "azure-devops-node-api";
import * as lim from "azure-devops-node-api/interfaces/LocationsInterfaces";

import * as ga from "azure-devops-node-api/GitApi";
import * as gi from "azure-devops-node-api/interfaces/GitInterfaces";

import * as tl from "azure-pipelines-task-lib/task";

async function run() {

    let selectionMethod = tl.getInput("repositorySelectionMethod", true);
    let repositoryId:string = null;
    let project:string = null;

    if(selectionMethod === "currentBuild") {

        let provider = getRepositoryProvider();

        if (provider !== "TfsGit") {
            throw `detected a repository provider that is not TfsGit. Provider "${provider}" is not supported.`;
        }

        let azdevApi: azdev.WebApi = await getWebApi();
        let gitApi: ga.IGitApi = await azdevApi.getGitApi();

        project = getProject();
        let repositoryName = getRepositoryName();

        console.log(`searching for repository "${repositoryName}" in project "${project}"`);

        const respositories: gi.GitRepository[] = await gitApi.getRepositories(project);

        if (respositories) {
            tl.debug(`found ${respositories.length} respositories:`);
            respositories.forEach((repository, index) => {
                tl.debug(repository.name);
            });
        } else {
            throw "cannot find any repositories";
        }

        let repository = respositories.filter(repository => {
            return repository.name === repositoryName;
        })[0];

        if (!repository) {
            throw `cannot find repository with name "${repositoryName}"`;
        }

        tl.debug(`found repository "${repository.name}" with id "${repository.id}"`);
        repositoryId = repository.id
    }else{
        repositoryId = tl.getInput("gitRepositoryId", true);
        project = tl.getInput("projectId", true);
    }

    await CreatePullRequest(project, repositoryId);
}

let taskManifestPath = path.join(__dirname, "task.json");
tl.debug("Setting resource path to " + taskManifestPath);
tl.setResourcePath(taskManifestPath);

run().then((result) => {
    tl.setResult(tl.TaskResult.Succeeded, "Create pull request succeeded");
}).catch((error) => {
    tl.setResult(tl.TaskResult.Failed, !!error.message ? error.message : error);
});

function getEnv(name: string): string {
    let val = process.env[name];
    if (!val) {
        console.error(name + " environment variable is not set");
        process.exit(1);
    }
    return val;
}

async function CreatePullRequest(project:string, repositoryId:string) {
    let azdevApi: azdev.WebApi = await getWebApi();
    let gitApi: ga.IGitApi = await azdevApi.getGitApi();

    let createPullRequest: gi.GitPullRequest = <gi.GitPullRequest>{};

    let sourceBranch = tl.getInput("sourceBranch", true);
    let targetBranch = tl.getInput("targetBranch", true);

    console.log(`creating pull request for source branch: "${sourceBranch}" and target branch: "${targetBranch}"`);
    createPullRequest.sourceRefName = sourceBranch;
    createPullRequest.targetRefName = targetBranch;
    createPullRequest.title = tl.getInput("title", true);
    createPullRequest.completionOptions = <gi.GitPullRequestCompletionOptions> {};
    createPullRequest.completionOptions.bypassPolicy = tl.getBoolInput("bypassPolicy");
    createPullRequest.completionOptions.deleteSourceBranch = tl.getBoolInput("deleteSourceBranch");
    createPullRequest.completionOptions.squashMerge = tl.getBoolInput("squashMerge");

    const requestedByAsReviewer = tl.getBoolInput("requestedByAsReviewer");
    createPullRequest.reviewers = [];
    if (requestedByAsReviewer) {
        const reviewer = <gi.IdentityRefWithVote> {id: tl.getVariable("Build.RequestedForId")};
        createPullRequest.reviewers.push(reviewer);
    }

    let pullRequest: gi.GitPullRequest = await gitApi.createPullRequest(createPullRequest, repositoryId, project, true);

    let pullRequestUrl = `${pullRequest.repository.webUrl}/pullrequest/${pullRequest.pullRequestId}`
    console.log(`=================================================`);
    console.log(`created pull request with id ${pullRequest.pullRequestId}: ${pullRequestUrl}`);

    tl.setVariable('PullRequestId', String(pullRequest.pullRequestId));
    tl.setVariable('PullRequestUrl', `${pullRequestUrl}`);

    if (tl.getBoolInput("approve")) {

        let approve: gi.IdentityRefWithVote = <gi.IdentityRefWithVote>{};
        approve.id = pullRequest.createdBy.id;
        approve.vote = 10;
        await gitApi.createPullRequestReviewer(approve, repositoryId, pullRequest.pullRequestId, pullRequest.createdBy.id, project);
    }

    if (tl.getBoolInput("autoComplete")) {
        let setAutoComplete = <gi.GitPullRequest>{};
        setAutoComplete.autoCompleteSetBy = pullRequest.createdBy;
        await gitApi.updatePullRequest(setAutoComplete, repositoryId, pullRequest.pullRequestId, project);
    }
}

async function getWebApi(): Promise<azdev.WebApi> {
    let serverUrl = getEnv("SYSTEM_TEAMFOUNDATIONCOLLECTIONURI");
    console.log(`connecting to VSTS web API"s on server: "${serverUrl}"`);
    return await getApi(serverUrl);
}

async function getApi(serverUrl: string): Promise<azdev.WebApi> {
    return new Promise<azdev.WebApi>(async (resolve, reject) => {
        try {
            let token = tl.getEndpointAuthorizationParameter("SystemVssConnection", "AccessToken", false);
            let authHandler = azdev.getPersonalAccessTokenHandler(token);
            let option = undefined;
            let azdevApi: azdev.WebApi = new azdev.WebApi(serverUrl, authHandler, option);
            let connData: lim.ConnectionData = await azdevApi.connect();

            console.log(`authenticated as user: "${connData.authenticatedUser.providerDisplayName}"`);
            resolve(azdevApi);
        }
        catch (err) {
            reject(err);
        }
    });
}

function getProject(): string {
    return getEnv("SYSTEM_TEAMPROJECT");
}

function getRepositoryProvider(): string {
    return getEnv("BUILD_REPOSITORY_PROVIDER");
}

function getRepositoryName(): string {
    return getEnv("BUILD_REPOSITORY_NAME");
}
