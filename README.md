# solid-simple-popover

[![version](https://img.shields.io/npm/v/solid-simple-popover?style=for-the-badge)](https://www.npmjs.com/package/solid-simple-popover)
![npm](https://img.shields.io/npm/dw/solid-simple-popover?style=for-the-badge)

A really simple and minimalistic popover component for your apps.

**IMPORTANT:**

- You may add `width: max-content` to the content element by yourself to avoid layout interference as it described [here](https://floating-ui.com/docs/computeposition#initial-layout).
- From version `1.7.0` popoverAPI enabled by [default](https://caniuse.com/mdn-api_htmlelement_popover) with mount fallback to `body`

## Features

- Minimalistic - no wrapper DOM nodes!
- Popover API support (with fallback)
- Full control over position
- Works with SSR and Astro
- Multiple trigger events with vue-style modifiers
- Custom anchor element

### No wrapper nodes

When you render the following code, only `button` (`<button data-popover-open="false">Toggle popover!</button>`) will appear in the DOM! No extra DOM nodes. Trigger node will have `data-popover-open` attribute, so you can use it in your CSS styles.

```tsx
<Popover trigger={<button>Toggle popover!</button>} content={<div>Nice content here</div>} />
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
<Popover
  trigger={<button>Toggle popover!</button>}
  content={<div>Nice content here</div>}
  usePopoverAPI
  // You may also provide an optional popover root
  // It will be used when popover API is not supported
  popoverAPIMountFallback={document.body}
/>
```

### Full control over position

You can pass all the options for positioning. See docs for [computePosition](https://floating-ui.com/docs/computePosition).

```tsx
import { flip } from "@floating-ui/dom";

<Popover
  trigger={<button type="button">I'm a trigger</button>}
  content={<div>I'm a content</div>}
  // Full control over position
  autoUpdate
  computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
/>;
```

### Multiple trigger events with vue-style modifiers

You can pass multiple trigger events with modifiers:

Events support the following modifiers:

- `capture`
- `once`
- `prevent`
- `stop`
- `passive`

```tsx
<Popover
  trigger={<button type="button">I'm a trigger</button>}
  content={<div>I'm a content</div>}
  triggerEvents="click.capture|pointerdown"
/>
```

### Custom anchor element

Sometimes it's necessary the anchor element to be different from trigger element. You may pass optional selector to find anchor element:

```tsx
<Popover
  trigger={<button id="trigger-button">Toggle popover</button>}
  content={
    <div>
      <button autofocus>hi</button>
      This div is visible when popover is open!
    </div>
  }
  anchorElementSelector="#anchor-element"
/>
```

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
  // You'll only see <button data-open="false" id="trigger-button">Toggle popover</button> in DOM
  trigger={<button id="trigger-button">Toggle popover</button>}
  // No wrapper nodes!
  content={<div>This div is visible when popover is open!</div>}
  // ------------------------------- The following props are optional
  // Full control over position
  autoUpdate
  computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
  // Popover API support (where possible)
  usePopoverAPI
  // When popover API is not supported, fallback to mounting content to body
  // SSR support
  popoverAPIMountFallback="body"
  // Highly customizable
  sameWidth
  dataAttributeName="data-open"
  // Astro support
  anchorElementSelector="#trigger-button"
  contentElementSelector="div"
/>;
```

## Types

```tsx
import { type ComputePositionConfig, type AutoUpdateOptions } from "@floating-ui/dom";
import { type JSXElement, type VoidComponent } from "solid-js";

export type PopoverProps = {
  /** HTML Element which triggers popover */
  trigger: JSXElement;
  /** Content to show. Must be HTML element */
  content: JSXElement;
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Disables listening to trigger events
   * Note: if your trigger element has `disabled` state (like button or input), popover also won't be triggered
   */
  disabled?: boolean;
  /** Should content have the same width as trigger */
  sameWidth?: boolean;
  /** Options for floating-ui computePosition function */
  computePositionOptions?: ComputePositionConfig;
  /**
   * @default "pointerdown"
   * If set to null no event would trigger popover,
   * so you need to trigger it mannually.
   * Event name or list of event names separated by "|" which triggers popover.
   * You may also add modifiers like "capture", "passive", "once", "prevent", "stop" to the event separated by ".":
   * @example "pointerdown.capture.once.prevent|click"
   */
  triggerEvents?: string | null;
  /**
   * HTMLElement or CSS selector (can be used in SSR) to mount popover content into
   */
  mount?: HTMLElement | string;
  /**
   * Close popover on interaction outside
   * @default true
   * By default when popover is open it will listen to "pointerdown" event outside of popover content and trigger
   */
  closeOnOutsideInteraction?: boolean;
  /**
   * Data attribute name to set on trigger element
   * @default "data-popover-open"
   */
  dataAttributeName?: string;
  /**
   * HTML element or CSS selector to find anchor element which is used for positioning
   * Can be used with Astro, because astro wraps trigger element into astro-slot
   * and position breaks
   */
  anchorElement?: string | HTMLElement;
  /**
   * CSS selector to find html element inside content
   * Can be used with Astro, because astro wraps element into astro-slot
   * and position breaks
   */
  contentElementSelector?: string;
  /**
   * autoUpdate option for floating ui
   * @see https://floating-ui.com/docs/autoupdate
   */
  autoUpdate?: boolean;
  /**
   * Applies only if autoUpdate is true
   * @see https://floating-ui.com/docs/autoupdate#options
   */
  autoUpdateOptions?: AutoUpdateOptions;
  /**
   * Use popover API where possible
   * @default true
   */
  usePopoverAPI?: boolean;
  /**
   * Close popover on escape key press.
   * Uses 'keydown' event with 'Escape' key.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * HTMLElement or CSS selector (can be used in SSR) to mount popover content into
   * Fallback for browsers that don't support Popover API
   * @default body
   */
  popoverAPIMountFallback?: HTMLElement | string;
  onOpenChange?: (open: boolean) => void;
};

export declare const Popover: VoidComponent<PopoverProps>;
```

## License

MIT
