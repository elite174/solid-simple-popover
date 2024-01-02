# solid-simple-popover

[![version](https://img.shields.io/npm/v/solid-simple-popover?style=for-the-badge)](https://www.npmjs.com/package/solid-simple-popover)
![npm](https://img.shields.io/npm/dw/solid-simple-popover?style=for-the-badge)

A really simple and minimalistic popover component for your apps.

## Installation

This package has the following peer dependencies:

```json
"@floating-ui/dom": "^1.5",
"solid-js": "^1.8"
```

so you need to install required packages by yourself.

`pnpm i solid-js @floating-ui/dom solid-simple-popover`

## Usage

```tsx
import { Popover } from "solid-simple-popover";
import { flip } from "@floating-ui/dom";

<Popover
  // Minimalistic
  as="button"
  // Awesome typings
  type="button"
  onClick={() => console.log("button clicked")}
  // Full control over position
  autoUpdate
  computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
  // Popover API support (where possible)
  usePopoverAPI
  content={<div>This div is visible when popover is open!</div>}
  // Only one DOM wrapper over content
  contentWrapperClass="content-wrapper-class"
  // Highly customizable
  ignoreOutsideInteraction
>
  Toggle popover
</Popover>;
```

## Features

- Minimalistic - only one wrapper element for the content!
- Awesome TS support
- Popover API support (with fallback)
- Full control over position
- Highly customizable with imperative API
- Works with SSR and Astro

### Uses only one DOM element to wrap your content

When you render the following code, only `button` (`<button data-expanded="false">Toggle popover!</button>`) will appear in the DOM! No extra DOM nodes. Trigger node will have `data-expanded` attribute, so you can use it in your CSS styles.

```tsx
<Popover content={<div>Nice content here</div>}>Toggle popover!</Popover>
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
<Popover as="input" placeholder="Type something" content={<span>hi</span>}></Popover>
```

```tsx
// TS error is here, because button doesn't have `placeholder` attribute
<Popover as="button" placeholder="Type something" content={<span>hi</span>}></Popover>
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
<Popover usePopoverAPI content={<div>Nice content here</div>}>
  Toggle popover!
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
      content={<input type="text" />}
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      autoUpdate
    >
      click
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
      as="input"
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
      as="input"
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
  content?: JSXElement;
  open?: boolean;
  defaultOpen?: boolean;
  /** Should content have the same width as trigger */
  sameWidth?: boolean;
  /** Options for floating-ui computePosition function */
  computePositionOptions?: ComputePositionConfig;
  /** @default "button" */
  as?: T;
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
