import * as cm from './common';
import * as vm from 'vso-node-api';

import * as ga from 'vso-node-api/GitApi';
import * as gi from 'vso-node-api/interfaces/GitInterfaces';

export async function run() {
    try
    {
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
            console.log(`found ${respositories.length} respositories`);
        }

        var repository = respositories.filter(repository => {
            return repository.name == repositoryName
        })[0];

        console.log(`found repository "${repository.name}" with id "${repository.id}"`)
        var pullRequest: gi.GitPullRequest = <gi.GitPullRequest>{};

        pullRequest.sourceRefName = "refs/heads/test"
        pullRequest.targetRefName = "refs/heads/master"
        pullRequest.title = "Automatic pull request from test to master"

        var result: gi.GitPullRequest = await gitApi.createPullRequest(pullRequest, repository.id, project, true);

        console.log(`created pull request with id ${result.pullRequestId}`)
    }
    catch (err) {
        console.error('Error: ' + err.stack);
    }

}