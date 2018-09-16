const octokit = require("@octokit/rest")();
const parse = require("csv-parse");
const fs = require("mz/fs");
const _ = require("lodash");
const argv = require("minimist")(process.argv.slice(2));

const [target, csv] = argv._;
const [owner, repo] = target.split(/\//);

const baseOpts = {
  owner,
  repo
};

octokit.authenticate(require("./auth.json"));

// TODO: 外部化
function reducer([
  tracker,
  status,
  priority,
  date,
  assignee,
  category,
  title,
  body
]) {
  const dateTag = date ? `期日: ${date}` : null;
  const priorityTag = priority ? `優先度: ${priority}` : null;
  return {
    title,
    body: _.compact([
      dateTag,
      priorityTag,
      body
    ]).join("\n"),
    labels: _.compact(["design", category, dateTag, priorityTag])
  };
}

function loadCsv(filePath) {
  return fs.readFile(filePath, "utf8").then(body => {
    return new Promise((resolve, reject) => {
      parse(body, { comment: "#" }, (err, output) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(output);
      });
    });
  });
}

function postIssue(issueOpts) {
  const opts = Object.assign({}, baseOpts, issueOpts);

  console.log(opts);

  return Promise.resolve();
  /*
  octokit.issues.create(opts).then((result) => {
    console.log(result);
  });
  */
}

loadCsv(csv).then(rows => {
  let p = Promise.resolve();
  _.each(rows, (row) => {
    p = p.then(() => {
      return postIssue(reducer(row));
    });
  });
});
