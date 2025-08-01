module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow conditional rendering of text nodes or JSX elements when they have siblings",
      recommended: false,
    },
    messages: {
      unexpected:
        "Conditional rendering of {{ kind }} inside a parent with other children can lead to stale text-node references.",
    },
    schema: [],
  },

  create(context) {
    /**
     * Filter out JSXText nodes that are only whitespace/tabs/newlines.
     */
    function meaningfulChildren(children) {
      return children.filter((child) => {
        if (child.type === "JSXText") {
          return child.value.trim().length > 0;
        }
        return true;
      });
    }

    /**
     * Is this expression a conditional or && logical expression?
     */
    function isConditionalLike(expr) {
      return (
        (expr.type === "LogicalExpression" && expr.operator === "&&") ||
        expr.type === "ConditionalExpression"
      );
    }

    /**
     * Does this expression potentially render a **text** node?
     */
    function yieldsText(expr) {
      if (expr.type === "LogicalExpression" && expr.operator === "&&") {
        const right = expr.right;
        return right.type === "Literal";
      }
      if (expr.type === "ConditionalExpression") {
        const { consequent, alternate } = expr;
        return [consequent, alternate].some((node) => node.type === "Literal");
      }
      return false;
    }

    function check(node) {
      const kids = meaningfulChildren(node.children);
      if (kids.length <= 1) {
        // only one real child → safe
        return;
      }

      // keep track of all meaningful text-node indices so we can detect case 2 below
      const textIndices = kids
        .map((c, i) =>
          (c.type === "JSXText" && c.value.trim()) ||
          (c.type === "JSXExpressionContainer" &&
            c.expression.type === "Literal")
            ? i
            : -1,
        )
        .filter((i) => i !== -1);

      // more than one child: look for conditional-like expression containers
      kids.forEach((child, idx) => {
        if (child.type !== "JSXExpressionContainer") {
          return;
        }
        const expr = child.expression;
        if (!isConditionalLike(expr)) return;

        // Case 1: conditional itself yields text
        if (yieldsText(expr)) {
          context.report({
            node: child,
            messageId: "unexpected",
            data: { kind: "a text node" },
          });
          return;
        }
        // Case 2: conditional yields element before a text node
        const hasLaterTextSibling = textIndices.some((ti) => ti > idx);
        if (hasLaterTextSibling) {
          context.report({
            node: child,
            messageId: "unexpected",
            data: { kind: "a conditional element before a text node" },
          });
        }
      });
    }

    return {
      JSXElement(node) {
        return check(node);
      },
      JSXFragment(node) {
        return check(node);
      },
    };
  },
};
