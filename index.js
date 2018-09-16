const readline = require("readline");
const octokit = require("@octokit/rest")();
const parse = require("csv-parse");
const fs = require("mz/fs");
const _ = require("lodash");
require("colors");

const MSG = ["Do you create issue with this option?".green, "[Y|n]"].join(" ");
const DEFAULT_REDUCER = ([ title, body, assignee, labels ]) => {
  return {
    title,
    body,
    assignee: assignee.split(/,/g),
    labels: labels.split(/,/g),
  }
};

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

function postIssue({ row, rl, baseOpts, reducer = DEFAULT_REDUCER }) {
  return new Promise((resolve, reject) => {
    const issueOpts = reducer(row);
    const opts = Object.assign({}, baseOpts, issueOpts);
    console.log(opts);

    rl.question(MSG, answer => {
      if (answer === "Y") {
        octokit.issues.create(opts).then(resolve, reject);
      } else {
        resolve();
      }
    });
  });
}

module.exports = function({ owner, repo, csv, reducer, auth }) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const baseOpts = {
    owner,
    repo
  };

  octokit.authenticate(auth);

  return Promise.resolve()
    .then(() => loadCsv(csv))
    .then(rows => {
      let p = Promise.resolve();
      _.each(rows, row => {
        p = p.then(() => {
          return postIssue({ row, rl, baseOpts, reducer });
        });
      });
      return p.then(() => {
        rl.close();
      });
    });
};
