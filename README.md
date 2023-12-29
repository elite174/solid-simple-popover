# solid-simple-popover

A really simple and minimalistic popover component for your apps.

## Features

### Uses only one DOM element to wrap your content

When you render the following code, only `button` will appear in the DOM! No extra DOM nodes.

```tsx
<Popover triggerElement={<button>Toggle popover!</button>}>
  <div>Nice content here</div>
</Popover>
```

When content is visible, it's wrapped with one extra DOM node, but you can control it with the following props:

```tsx
childrenWrapperClass?: string;
childrenWrapperStyles?: JSX.CSSProperties;
/** @default "div" */
childrenWrapperTag?: string;
getContentWrapperElement?: (element: HTMLElement) => void;
```

### Popover API support

You can use PopoverAPI! Just pass `usePopoverAPI` prop. Popover will automotically fallback to non-api behavior if popover API is not supported.

Don't forget to reset default browser styles for `[popover]`:

```css
[popover] {
  margin: 0;
  background-color: transparent;
  padding: 0;
  border: 0;
}
```

```tsx
<Popover triggerElement={<button>Toggle popover!</button>} usePopoverAPI>
  <div>Nice content here</div>
</Popover>
```

### Full control over position

You can pass all the options for positioning. See docs for computePosition.

## Examples

### Uncontrolled state

```tsx
import { Popover } from "solid-simple-popover";

const UncontrolledExample = () => {
  return (
    <Popover triggerElement={<button>Toggle popover!</button>}>
      <div>Nice content here</div>
    </Popover>
  );
};
```

### Controlled state

```tsx
import { createSignal } from "solid-js";
import { Popover } from "solid-simple-popover";

const ControlledExample = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <Popover open={open()} triggerElement={<button onClick={() => setOpen((open) => !open)}>Toggle popover!</button>}>
      <div>Nice content here</div>
    </Popover>
  );
};
```

### Position options

```tsx
import { Popover } from "solid-simple-popover";

import { flip } from "@floating-ui/dom";

const PositionOptionsExample = () => {
  return (
    <Popover
      defaultOpen
      triggerElement={<button>click</button>}
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      autoUpdate
    >
      <input type="text" />
    </Popover>
  );
};
```

## Props

```ts
type PopoverProps = {
  /** HTMLElement which triggers popover state. Must be HTMLElement. */
  triggerElement: JSXElement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Should content have the same width as trigger */
  sameWidth?: boolean;
  /** Options for floating-ui computePosition function */
  computePositionOptions?: ComputePositionConfig;
  childrenWrapperClass?: string;
  childrenWrapperStyles?: JSX.CSSProperties;
  /** @default "div" */
  childrenWrapperTag?: string;
  /** Use popover API where possible */
  usePopoverAPI?: boolean;
  onOpenChange?: (open: boolean) => void;
  getContentWrapperElement?: (element: HTMLElement) => void;
} & (
  | {
      // autoUpdate option for floating-ui
      autoUpdate?: false;
      autoUpdateOptions?: never;
    }
  | { autoUpdate: true; autoUpdateOptions?: AutoUpdateOptions }
);
```

## License

MIT
