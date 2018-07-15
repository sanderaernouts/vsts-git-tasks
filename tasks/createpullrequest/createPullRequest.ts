import path = require('path');

import * as cm from '../common';
import * as vm from 'vso-node-api';

import * as ga from 'vso-node-api/GitApi';
import * as gi from 'vso-node-api/interfaces/GitInterfaces';
import { IdentityRef } from 'vso-node-api/interfaces/common/VSSInterfaces';

import * as taskLib from 'vsts-task-lib/task';

async function run() {

    var provider = cm.getRepositoryProvider();

    if(provider.indexOf("Git") < 0) {
        throw 'detected a repository provider that is not Git. Provider "' + provider + '" is not supported.'
    }

    let vsts: vm.WebApi = await cm.getWebApi();
    let gitApi: ga.IGitApi = await vsts.getGitApi();

    const project: string = cm.getProject();
    const repositoryName = cm.getRepositoryName();

    console.log(`searching for repository "${repositoryName}" in project "${project}"`)

    
    const respositories: gi.GitRepository[] = await gitApi.getRepositories(project);

    if (respositories) {
        taskLib.debug(`found ${respositories.length} respositories:`);
        respositories.forEach((repository, index) => {
            taskLib.debug(repository.name)
        })
    }else{
        throw `cannot find any repositories`
    }

    var repository = respositories.filter(repository => {
        return repository.name == repositoryName
    })[0];

    if(!repository) {
        throw `cannot find repository with name "${repositoryName}"`
    }

    taskLib.debug(`found repository "${repository.name}" with id "${repository.id}"`)
    var createPullRequest: gi.GitPullRequest = <gi.GitPullRequest>{};

    var sourceBranch = taskLib.getInput("sourceBranch", true)
    var targetBranch = taskLib.getInput("targetBranch", true)

    console.log(`creating pull request for source branch: "${sourceBranch}" and target branch: "${targetBranch}"`)
    createPullRequest.sourceRefName = 
    createPullRequest.targetRefName = "refs/heads/master"
    createPullRequest.title = "Automatic pull request from test to master"
    

    var pullRequest: gi.GitPullRequest = await gitApi.createPullRequest(createPullRequest, repository.id, project, true);
    console.log(`created pull request with id ${pullRequest.pullRequestId}`)

    var autoComplete:boolean = taskLib.getBoolInput("autoComplete");

    if(autoComplete) {
        var setAutoComplete =<gi.GitPullRequest>{};
        setAutoComplete.autoCompleteSetBy = pullRequest.createdBy;
        setAutoComplete.completionOptions = <gi.GitPullRequestCompletionOptions>{};
        setAutoComplete.completionOptions.bypassPolicy = taskLib.getBoolInput("bypassPolicy");
        setAutoComplete.completionOptions.deleteSourceBranch = taskLib.getBoolInput("deleteSourceBranch");
        setAutoComplete.completionOptions.squashMerge = taskLib.getBoolInput("squashMerge");
    }

    await gitApi.updatePullRequest(setAutoComplete, repository.id, pullRequest.pullRequestId, project)

    var approve: gi.IdentityRefWithVote = <gi.IdentityRefWithVote>{}
    approve.id = pullRequest.createdBy.id
    approve.vote=10
    
    await gitApi.createPullRequestReviewer(approve, repository.id, pullRequest.pullRequestId, pullRequest.createdBy.id, project) 
}

var taskManifestPath = path.join(__dirname, "task.json");
taskLib.debug("Setting resource path to " + taskManifestPath);
taskLib.setResourcePath(taskManifestPath);


run().then((result) => {
    taskLib.setResult(taskLib.TaskResult.Succeeded, "Create pull request succeeded")
    }).catch((error) => {
        taskLib.setResult(taskLib.TaskResult.Failed, !!error.message ? error.message : error)
    }
);