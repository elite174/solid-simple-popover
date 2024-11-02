import {
  type JSXElement,
  type ChildrenReturn,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  createUniqueId,
  createComputed,
  on,
  children,
  mergeProps,
  type ParentComponent,
  untrack,
} from "solid-js";

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

const getElement = (element: JSXElement): Element | undefined | null => {
  if (typeof element === "string") return document.querySelector(element);

  if (element !== null && element !== undefined && !(element instanceof HTMLElement))
    throw new Error("trigger must be an HTML element or null or undefined");

  return element;
};

const getContentElement = (childrenReturn: ChildrenReturn, elementSelector?: string): HTMLElement => {
  let element = childrenReturn();

  if (!(element instanceof HTMLElement)) throw new Error("content must be HTML element");

  if (elementSelector) {
    element = element.matches(elementSelector) ? element : element.querySelector(elementSelector);

    if (!(element instanceof HTMLElement)) throw new Error(`Unable to find element with selector "${elementSelector}"`);
  }

  return element;
};

const DEFAULT_PROPS = Object.freeze({
  triggerEvents: "pointerdown",
  dataAttributeName: "data-popover-open",
  closeOnEscape: true,
  closeOnOutsideInteraction: true,
  computePositionOptions: {
    /**
     * Default position here is absolute, because there might be some bugs in safari with "fixed" position
     * @see https://stackoverflow.com/questions/65764243/position-fixed-within-a-display-grid-on-safari
     */
    strategy: "absolute" as const,
  },
}) satisfies Partial<PopoverProps>;

export const Popover: ParentComponent<PopoverProps> = (initialProps) => {
  const props = mergeProps(DEFAULT_PROPS, initialProps);
  const [open, setOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  // sync state with props
  createComputed(
    on(
      () => Boolean(props.open),
      (isOpen) => {
        setOpen(isOpen);
        props.onOpenChange?.(isOpen);
      },
      { defer: true }
    )
  );

  createEffect(() => {
    const events = (props.triggerEvents === undefined ? DEFAULT_PROPS.triggerEvents : props.triggerEvents)?.split("|");

    if (events === undefined || events.length === 0) return;
    if (props.disabled) return;

    const abortController = new AbortController();
    const trigger = getElement(props.triggerElement);

    if (!(trigger instanceof HTMLElement)) return;

    events.forEach((event) => {
      const [eventName, ...modifiers] = event.split(".");
      const modifiersSet = new Set(modifiers);

      trigger.addEventListener(
        eventName,
        (e: Event) => {
          if (modifiersSet.has("prevent")) e.preventDefault();
          if (modifiersSet.has("stop")) e.stopPropagation();

          // don't trigger if trigger is disabled
          if (e.target && "disabled" in e.target && e.target.disabled) return;

          const newOpenValue = !open();
          // if uncontrolled, set open state
          if (props.open === undefined) setOpen(newOpenValue);
          props.onOpenChange?.(newOpenValue);
        },
        {
          signal: abortController.signal,
          capture: modifiersSet.has("capture"),
          passive: modifiersSet.has("passive"),
          once: modifiersSet.has("once"),
        }
      );
    });

    onCleanup(() => abortController.abort());
  });

  createEffect(() => {
    const dataAttributeName = props.dataAttributeName;
    const trigger = getElement(props.triggerElement);

    // if there's no trigger no need to set an attribute
    // Should we set it on anchor element?
    if (!(trigger instanceof HTMLElement)) return;

    createEffect(() => trigger.setAttribute(dataAttributeName, String(open())));

    onCleanup(() => trigger.removeAttribute(dataAttributeName));
  });

  return (
    <Show when={open()}>
      {(_) => {
        const resolvedContent = children(() => props.children);

        createEffect(() => {
          const trigger = getElement(props.triggerElement);
          const content = getContentElement(resolvedContent, props.contentElementSelector);
          const anchorElement = props.anchorElement
            ? typeof props.anchorElement === "string"
              ? document.querySelector(props.anchorElement)
              : props.anchorElement
            : trigger;

          if (!(anchorElement instanceof HTMLElement)) throw new Error("Unable to find anchor element");

          const anchorName = `--anchor-${String(Math.random()).slice(2, 6)}`;

          // @ts-expect-error ts(2339)
          anchorElement.style.anchorName = anchorName;
          // @ts-expect-error ts(2339)
          content.style.positionAnchor = anchorName;

          createEffect(() => {
            content.style.position = props.targetPosition ?? "absolute";
          });

          createEffect(() => {
            if (typeof props.targetPositionArea === "string") {
              // @ts-expect-error ts(2339)
              content.style.positionArea = props.targetPositionArea ?? "";

              onCleanup(() => {
                // @ts-expect-error ts(2339)
                content.style.positionArea = "";
              });
            } else if (typeof props.targetPositionArea === "object") {
              const targetPositionAreaObject = props.targetPositionArea;

              content.style.top = untrack(() => targetPositionAreaObject.top?.(anchorName)) ?? "";
              content.style.left = untrack(() => targetPositionAreaObject.left?.(anchorName)) ?? "";
              content.style.right = untrack(() => targetPositionAreaObject.right?.(anchorName)) ?? "";
              content.style.bottom = untrack(() => targetPositionAreaObject.bottom?.(anchorName)) ?? "";

              onCleanup(() => {
                content.style.top = "";
                content.style.left = "";
                content.style.right = "";
                content.style.bottom = "";
              });
            } else {
              // @ts-expect-error ts(2339)
              content.style.positionArea = "end center";

              onCleanup(() => {
                // @ts-expect-error ts(2339)
                content.style.positionArea = "";
              });
            }
          });

          createEffect(() => {
            // @ts-expect-error ts(2339)
            content.style.positionVisibility = props.positionVisibility ?? "";
          });

          createEffect(() => {
            // @ts-expect-error ts(2339)
            content.style.positionTryFallbacks = untrack(() => props.positionTryFallbacks!(anchorName).join(",")) ?? "";
          });

          createEffect(() => {
            // @ts-expect-error ts(2339)
            content.style.positionTryOrder = props.positionTryOrder ?? "";
          });

          createEffect(() => {
            content.style.width = props.targetWidth ?? "";
          });

          createEffect(() => {
            content.style.height = props.targetHeight ?? "";
          });

          createEffect(() => {
            if (!props.closeOnOutsideInteraction) return;
            if (!trigger) return;

            // Handle click outside correctly
            const handleClickOutside = (e: MouseEvent) => {
              const eventPath = e.composedPath();

              if (eventPath.includes(trigger) || eventPath.includes(content)) return;

              // if uncontrolled, close popover
              if (props.open === undefined) setOpen(false);
              props.onOpenChange?.(false);
            };

            document.addEventListener("pointerdown", handleClickOutside);
            onCleanup(() => document.removeEventListener("pointerdown", handleClickOutside));
          });

          createEffect(() => {
            if (!trigger) return;

            const popoverId = createUniqueId();

            trigger.setAttribute("popovertarget", popoverId);
            content.setAttribute("popover", "manual");
            content.setAttribute("id", `popover-${popoverId}`);

            if (!content.matches(":popover-open")) content.showPopover();

            onCleanup(() => trigger.removeAttribute("popovertarget"));
          });

          // Listen to escape key down to close popup
          createEffect(() => {
            if (!props.closeOnEscape) return;

            const handleKeydown = (e: KeyboardEvent) => {
              if (e.key !== "Escape") return;

              // if content is not in the event path, return
              if (e.target instanceof Node && (content.contains(e.target) || trigger?.contains(e.target))) return;

              // if uncontrolled, close popover
              if (props.open === undefined) setOpen(false);
              props.onOpenChange?.(false);
            };

            document.addEventListener("keydown", handleKeydown);
            onCleanup(() => document.removeEventListener("keydown", handleKeydown));
          });
        });

        return resolvedContent();
      }}
    </Show>
  );
};
