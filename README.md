# eslint-plugin-no-conditional-text-node

An ESLint 8 plugin to catch React text node conditionals that may lead to browser-translation-based errors, as outlined in [this issue](https://github.com/facebook/react/issues/11538#issuecomment-390386520).

This plugin will error on the following cases:

```jsx
// Case 1
<div>
  {condition && 'Welcome'}
  <span>Something</span>
</div>

// Case 2
<div>
  {condition && <span>Something</span>}
  Welcome
</div>
```

## Usage

```js
module.exports = {
  plugins: ['no-conditional-text-node'],
  rules: {
    'no-conditional-text-node/no-conditional-text-node': 'error'
  }
}
```
