const octokit = require('@octokit/rest')();
const argv = require('minimist')(process.argv.slice(2));

octokit.authenticate(require('./auth.json'));

const [ target ] = argv._;
const [owner,repo] = target.split(/\//);

const opts = {
  owner,
  repo,
  title: 'test',
  body: ['テスト本文', '二行以上の文章'].join('\n'),
  // assignee: 'fnobi',
  labels: ['design'],
};

console.log(opts);

/*
octokit.issues.create(opts).then((result) => {
  console.log(result);
});
*/
