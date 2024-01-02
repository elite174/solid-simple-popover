# solid-simple-popover

A really simple and minimalistic popover component for your apps.

## Features

- Minimalistic - only one wrapper element for the content!
- Awesome TS support
- Popover API support (with fallback)
- Full control over position
- Highly customizable with imperative API
- Works with SSR and Astro

### Uses only one DOM element to wrap your content

When you render the following code, only `button` (`<button>Toggle popover!</button>`) will appear in the DOM! No extra DOM nodes.

```tsx
<Popover triggerContent="Toggle popover!">
  <div>Nice content here</div>
</Popover>
```

When content is visible, it's wrapped with one extra DOM node, but you can control it with the following props:

```tsx
contentWrapperClass?: string;
contentWrapperStyles?: JSX.CSSProperties;
/** @default "div" */
contentWrapperTag?: string;
```

Also you may use imperative API to get the wrapper element.

## Awesome TS support

By default popover trigger element is button, however it can be anything:

```tsx
// No TS Error!
<Popover triggerTag="input" placeholder="Type something">
  <span>hi</span>
</Popover>
```

```tsx
// TS error is here, because button doesn't have `placeholder` attribute
<Popover triggerTag="button" placeholder="Type something">
  <span>hi</span>
</Popover>
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
<Popover triggerContent="Toggle popover!" usePopoverAPI>
  <div>Nice content here</div>
</Popover>
```

### Full control over position

You can pass all the options for positioning. See docs for [computePosition](https://floating-ui.com/docs/computePosition).

```tsx
import { Popover } from "solid-simple-popover";
import { flip } from "@floating-ui/dom";

const PositionOptionsExample = () => {
  return (
    <Popover
      defaultOpen
      triggerContent="click"
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      autoUpdate
    >
      <input type="text" />
    </Popover>
  );
};
```

### Highly customizable with imperative API

It's possible to trigger popover with custom events!

```tsx
import { Popover, type PopoverAPI } from "solid-simple-popover";
import { createEffect, createSignal, onCleanup } from "solid-js";

function App() {
  const [open, setOpen] = createSignal(false);
  const [poppoverAPI, setPopoverAPI] = createSignal<PopoverAPI>();

  createEffect(() => {
    const trigger = poppoverAPI()?.getTriggerElement();

    const openPopover = () => setOpen(true);
    const closePopover = () => setOpen(false);

    // You may directly add these listeners to the popover
    // thanks to awesome TS support.
    // This is an artificial example.
    trigger?.addEventListener("focus", openPopover);
    trigger?.addEventListener("blur", closePopover);

    onCleanup(() => {
      trigger?.removeEventListener("focus", openPopover);
      trigger?.removeEventListener("blur", closePopover);
    });
  });

  return (
    <Popover
      open={open()}
      triggerTag="input"
      placeholder="Input some value"
      // Don't trigger popover with pointerdown event
      triggerEvent={null}
      getAPI={setPopoverAPI}
    >
      <span>hi</span>
    </Popover>
  );
}
```

The example above is literally this:

```tsx
import { Popover } from "solid-simple-popover";
import { createSignal } from "solid-js";

function App() {
  const [open, setOpen] = createSignal(false);

  return (
    <Popover
      open={open()}
      triggerTag="input"
      placeholder="Input some value"
      // Don't trigger popover with pointerdown event
      triggerEvent={null}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span>hi</span>
    </Popover>
  );
}
```

## Types

```ts
import { type ComputePositionConfig, type AutoUpdateOptions } from "@floating-ui/dom";
import { type ComponentProps, type JSXElement, type JSX } from "solid-js";

export type PopoverAPI = {
  getContentWrapperElement: () => HTMLElement | undefined;
  getTriggerElement: () => HTMLElement | undefined;
};

export type PopoverBaseProps<T> = {
  children?: JSXElement;
  triggerContent?: JSXElement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Should content have the same width as trigger */
  sameWidth?: boolean;
  /** Options for floating-ui computePosition function */
  computePositionOptions?: ComputePositionConfig;
  triggerClass?: string;
  triggerStyles?: JSX.CSSProperties;
  /** @default "button" */
  triggerTag?: T;
  /**
   * @default "pointerdown"
   * if set to null no event would trigger popover,
   * so you need to trigger it mannually with imperative API
   */
  triggerEvent?: string | null;
  contentWrapperClass?: string;
  contentWrapperStyles?: JSX.CSSProperties;
  /** @default "div" */
  contentWrapperTag?: string;
  /** HTMLElement to mount popover content into */
  mount?: HTMLElement;
  /** Use popover API where possible */
  usePopoverAPI?: boolean;
  /**
   * Ignore outside interaction when popover is open
   * By default when popover is open it will listen to "pointerdown" event outside of popover content and trigger
   */
  ignoreOutsideInteraction?: boolean;
  onOpenChange?: (open: boolean) => void;
  getAPI?: (api: PopoverAPI) => void;
} & (
  | {
      autoUpdate?: false;
      autoUpdateOptions?: undefined;
    }
  | {
      autoUpdate: true;
      autoUpdateOptions?: AutoUpdateOptions;
    }
);

export type PopoverProps<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & PopoverBaseProps<T>;

export declare const Popover: <T extends keyof JSX.IntrinsicElements = "button">(
  initialProps: PopoverProps<T>
) => JSX.Element;
```

## License

MIT
