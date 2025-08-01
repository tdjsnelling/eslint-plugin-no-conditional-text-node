const noConditionalTextNode = require("./lib/rules/no-conditional-text-node.js");

module.exports = {
  meta: {
    name: "no-conditional-text-node",
  },
  rules: {
    "no-conditional-text-node": noConditionalTextNode,
  },
};
