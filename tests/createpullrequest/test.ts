// do first just to ensure variables set
// export API_URL=https://buildcanary.visualstudio.com/DefaultCollection
// export export API_TOKEN=<yourAllScopesApiToken>
// export API_PROJECT=test
import * as cm from '../../tasks/common';

function run() {
    console.log('Running tests');
    cm.banner('Test');
    var task = require('../../tasks/createpullrequest/task.js');
    task.run();
}

run();