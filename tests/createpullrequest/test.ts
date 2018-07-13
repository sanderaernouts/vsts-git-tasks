import * as cm from '../../tasks/common';
import tmrm = require('vsts-task-lib/mock-run');
import path = require('path');

let taskPath = path.join(__dirname, '../../tasks/createpullrequest', 'createPullRequest.js');
let tr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);
tr.setInput("autoComplete", "true");
tr.setInput("sourceBranch", "refs/heads/test");
tr.setInput("targetBranch", "refs/heads/master");

tr.registerMock('vsts-task-lib/toolrunner', require('vsts-task-lib/mock-toolrunner'));
console.log('Running tests');
cm.banner('Test');
tr.run(); 