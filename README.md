# oct-issue-post

```js
const octIssuePost = require("oct-issue-post");

octIssuePost({
  owner: "fnobi",
  repo: "oct-issue-post",
  csv: "./sample.csv",
  auth: require("./auth.json"), // see https://github.com/octokit/rest.js/#authentication
  reducer: ([title, body, assignee, labels]) => {
    return {
      title,
      body,
      assignee: assignee.split(/,/g),
      labels: labels.split(/,/g)
    };
  }
});
```
