# 3.0.0

- Dropped floating UI. Used CSS anchor positioning API. See updated types in README.

# 2.0.0

- Now triggerElement is optional. Moreover you can pass a CSS selector for a trigger element, so you have full control over
  trigger position.
- Popover is a ParentComponent now, so you should pass only popover content as children. Children won't be evaluated when
  popover is closed.

```tsx
<button id="trigger">I'm a trigger</button>
<Popover triggerElement="#trigger">
  <div>I'm the content!</div>
</Popover>
```

# 1.10.0

- Added `onComputePosition` callback which receives `ComputePositionDataReturn`

# 1.9.0

- Popover API is used by default without possibility to disable it.
- Removed props `usePopoverAPI`, `popoverAPIMountFallback`, `mount`

# 1.8.0

- `anchorElementSelector` => `anchorElement`. Now you can pass HTML element or CSS selector.

# 1.7.0

- Popover API enabled by default with mount fallback to `body`
- Supported multiple trigger events with modifiers
- Supported custom anchor element

# 1.6.0

- Added `disabled` prop which disables triggering popover. Popover now also looks at `disabled` state of triggering html element.

# 1.5.0

- Added new prop: `closeOnEscape`. If `true` (by default) the popover will be closed if `Escape` key pressed.
- `ignoreOutsideInteraction` => `closeOnOutsideInteraction` (`true` by default)
