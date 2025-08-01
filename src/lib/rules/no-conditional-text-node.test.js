const { RuleTester } = require("eslint");
const noConditionalTextNode = require("./no-conditional-text-node.js");

const ruleTester = new RuleTester({
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2023,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
});

ruleTester.run("no-conditional-text-node", noConditionalTextNode, {
  valid: [
    // The “safe” single-child text node
    `
      <div>{show && 'Welcome'}</div>
    `,
    // Plain text without any conditional
    `
      <div>
        <span>Hello</span>
      </div>
    `,
    // Plain text without any conditional
    `
      <div>
        {condition && <span>Welcome</span>}
        <span>Hello</span>
      </div>
    `,
  ],

  invalid: [
    // Conditionally rendered text node that has siblings
    {
      code: `
        <div>
          {condition && 'Welcome'}
          <span>Something</span>
        </div>
      `,
      errors: [
        {
          messageId: "unexpected",
          type: "JSXExpressionContainer",
        },
      ],
    },

    // Node inserted before a text node
    {
      code: `
        <div>
          {condition && <span>Something</span>}
          Welcome
        </div>
      `,
      errors: [
        {
          messageId: "unexpected",
          type: "JSXExpressionContainer",
        },
      ],
    },
  ],
});

console.log("All tests passed!");
