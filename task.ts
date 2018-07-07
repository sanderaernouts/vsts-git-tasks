import * as cm from './common';
import * as vm from 'vso-node-api';

import * as ga from 'vso-node-api/GitApi';
import * as gi from 'vso-node-api/interfaces/GitInterfaces';

export async function run() {
    try
    {
        let vsts: vm.WebApi = await cm.getWebApi();
        let gitApi: ga.IGitApi = await vsts.getGitApi();

        var pullRequest = <gi.GitPullRequest>{};
        gitApi.getRepositories("")
    }
    catch (err) {
        console.error('Error: ' + err.stack);
    }

}