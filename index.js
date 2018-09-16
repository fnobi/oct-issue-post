const readline = require("readline");
const octokit = require("@octokit/rest")();
const parse = require("csv-parse");
const fs = require("mz/fs");
const _ = require("lodash");
const argv = require("minimist")(process.argv.slice(2));
require("colors");

const reducer = require("./reducer");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const [target, csv] = argv._;
const [owner, repo] = target.split(/\//);

const baseOpts = {
  owner,
  repo
};

octokit.authenticate(require("./auth.json"));

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

function postIssue(row) {
  return new Promise((resolve, reject) => {
    const issueOpts = reducer(row);
    const opts = Object.assign({}, baseOpts, issueOpts);
    console.log(opts);

    const msg = ["Do you create issue with this option?".green, "[Y|n]"].join(
      " "
    );

    rl.question(msg, answer => {
      if (answer === "Y") {
        octokit.issues.create(opts).then(resolve, reject);
      } else {
        resolve();
      }
    });
  });
}

loadCsv(csv).then(rows => {
  let p = Promise.resolve();
  _.each(rows, row => {
    p = p.then(() => {
      return postIssue(row);
    });
  });
  p.then(() => {
    rl.close();
  });
});
