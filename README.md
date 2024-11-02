# solid-simple-popover

[![version](https://img.shields.io/npm/v/solid-simple-popover?style=for-the-badge)](https://www.npmjs.com/package/solid-simple-popover)
![npm](https://img.shields.io/npm/dw/solid-simple-popover?style=for-the-badge)

A really simple and minimalistic popover component for your apps with CSS anchor position support.

**V2 docs are [here](https://github.com/elite174/solid-simple-popover/tree/v2)**

## Features

- Minimalistic - no wrapper DOM nodes!
- Popover API support
- Full control over position (CSS Anchor positioning)
- Works with SSR and Astro
- Multiple trigger events with vue-style modifiers
- Custom anchor element

### No wrapper nodes

No extra DOM nodes. Trigger node will have `data-popover-open` attribute, so you can use it in your CSS styles.

```tsx
<button id="trigger-element">Toggle popover!</button>
<Popover triggerElement="#trigger-element">
  <div>Nice content here</div>
</Popover>
```

### Popover API support

This component uses Popover API by default.

Don't forget to reset default browser styles for `[popover]`:

```css
[popover] {
  margin: 0;
  background-color: transparent;
  padding: 0;
  border: none;
}
```

### Full control over position

You can pass all the options for positioning. See docs for [computePosition](https://floating-ui.com/docs/computePosition).

```tsx
<button id="trigger-element">Toggle popover!</button>
<Popover
  triggerElement="#trigger-element"
  // Full control over position
  targetPositionArea="top center"
>
  <div>I'm a content</div>
</Popover>;
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
<button id="trigger-element">Toggle popover!</button>
<Popover
  triggerElement="#trigger-element"
  triggerEvents="click.capture|pointerdown"
>
  <div>I'm a content</div>
</Popover>
```

### Custom anchor element

Sometimes it's necessary the anchor element to be different from trigger element. You may pass optional selector to find anchor element:

```tsx
<div id="anchor-element"></div>
<button id="trigger-element">Toggle popover!</button>
<Popover
  triggerElement="#trigger-element"
  // Here you can pass CSS selector or HTML element
  anchorElement="#anchor-element"
>
  <div>
    <button autofocus>hi</button>
    This div is visible when popover is open!
  </div>
</Popover>
```

## Installation

This package has the following peer dependencies:

```json
"solid-js": "^1.8"
```

so you need to install required packages by yourself.

`pnpm i solid-js solid-simple-popover`

## Usage

```tsx
import { Popover } from "solid-simple-popover";

<button id="trigger-button">Toggle popover</button>
<Popover
  triggerElement="trigger-button"
  dataAttributeName="data-open"
  // You may pass custom selector here
  anchorElement="#trigger-button"
  // Astro support
  contentElementSelector="div"
>
  <div>This div is visible when popover is open!</div>
</Popover>;
```

## Types

```tsx
import { JSXElement, ParentComponent } from "solid-js";
type ValidPositionAreaX =
  | "left"
  | "right"
  | "start"
  | "end"
  | "center"
  | "selft-start"
  | "self-end"
  | "x-start"
  | "x-end";
type ValidPositionAreaY =
  | "top"
  | "bottom"
  | "start"
  | "end"
  | "center"
  | "self-start"
  | "self-end"
  | "y-start"
  | "y-end";
export type PositionArea = `${ValidPositionAreaY} ${ValidPositionAreaX}`;
export type TargetPositionArea =
  | PositionArea
  | {
      top?: (anchorName: string) => string;
      left?: (anchorName: string) => string;
      right?: (anchorName: string) => string;
      bottom?: (anchorName: string) => string;
    };
export type PopoverProps = {
  /**
   * HTML Element or CSS selector to find trigger element which triggers popover
   */
  triggerElement?: JSXElement;
  /**
   * HTML element or CSS selector to find anchor element which is used for positioning
   * Can be used with Astro, because astro wraps trigger element into astro-slot
   * and position breaks
   */
  anchorElement?: string | HTMLElement;
  open?: boolean;
  defaultOpen?: boolean;
  /**
   * Disables listening to trigger events
   * Note: if your trigger element has `disabled` state (like button or input), popover also won't be triggered
   */
  disabled?: boolean;
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
   * CSS selector to find html element inside content
   * Can be used with Astro, because astro wraps element into astro-slot
   * and position breaks
   */
  contentElementSelector?: string;
  /**
   * Close popover on escape key press.
   * Uses 'keydown' event with 'Escape' key.
   * @default true
   */
  closeOnEscape?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** @default absolute */
  targetPosition?: "absolute" | "fixed";
  /**
   * @see https://css-tricks.com/css-anchor-positioning-guide/#aa-position-area
   * @default "end center"
   */
  targetPositionArea?: TargetPositionArea;
  /** @see https://css-tricks.com/css-anchor-positioning-guide/#aa-position-visibility */
  positionVisibility?: "always" | "anchors-visible" | "no-overflow";
  /** @see https://css-tricks.com/css-anchor-positioning-guide/#aa-position-try-fallbacks */
  positionTryFallbacks?: (anchorName: string) => string[];
  /** @see https://css-tricks.com/css-anchor-positioning-guide/#aa-position-try-order */
  positionTryOrder?: "normal" | "most-width" | "most-height" | "most-block-size" | "most-inline-size";
  /** @see https://css-tricks.com/css-anchor-positioning-guide/#aa-anchor-size */
  targetWidth?: string;
  /** @see https://css-tricks.com/css-anchor-positioning-guide/#aa-anchor-size */
  targetHeight?: string;
};
export declare const Popover: ParentComponent<PopoverProps>;
```

## License

MIT
