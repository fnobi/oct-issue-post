const _ = require("lodash");

module.exports = ([
  tracker,
  status,
  priority,
  date,
  assignee,
  category,
  title,
  body
]) => {
  const dateTag = date ? `期日: ${date}` : null;
  const priorityTag = priority ? `優先度: ${priority}` : null;
  return {
    title,
    body: _.compact([dateTag, priorityTag, body]).join("\n"),
    labels: _.compact(["design", category, dateTag, priorityTag])
  };
};
