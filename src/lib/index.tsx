import { autoUpdate, computePosition, type ComputePositionConfig, type AutoUpdateOptions } from "@floating-ui/dom";
import {
  type JSXElement,
  type ChildrenReturn,
  type VoidComponent,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  createUniqueId,
  createComputed,
  on,
  children,
} from "solid-js";

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

// Remove this when Firefox supports Popover API
const checkPopoverSupport = () => HTMLElement.prototype.hasOwnProperty("popover");

const getElement = (childrenReturn: ChildrenReturn, elementSelector?: string): HTMLElement => {
  let element = childrenReturn();
  if (!(element instanceof HTMLElement)) throw new Error("trigger and content must be HTML elements");

  if (elementSelector) {
    element = element.matches(elementSelector) ? element : element.querySelector(elementSelector);

    if (!(element instanceof HTMLElement)) throw new Error(`Unable to find element with selector "${elementSelector}"`);
  }

  return element;
};

const getMountElement = (mountTarget: HTMLElement | string): HTMLElement => {
  if (mountTarget instanceof HTMLElement) return mountTarget;

  const element = document.querySelector(mountTarget);
  if (!element || !(element instanceof HTMLElement))
    throw new Error(`Unable to find mount element with selector "${mountTarget}"`);

  return element;
};

const DEFAULT_PROPS = Object.freeze({
  triggerEvents: "pointerdown",
  dataAttributeName: "data-popover-open",
  closeOnEscape: true,
  closeOnOutsideInteraction: true,
  usePopoverAPI: true,
  popoverAPIMountFallback: "body",
  computePositionOptions: {
    /**
     * Default position here is absolute, because there might be some bugs in safari with "fixed" position
     * @see https://stackoverflow.com/questions/65764243/position-fixed-within-a-display-grid-on-safari
     */
    strategy: "absolute" as const,
  },
}) satisfies Partial<PopoverProps>;

export const Popover: VoidComponent<PopoverProps> = (props) => {
  const [open, setOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  const resolvedTrigger = children(() => props.trigger);

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
    const trigger = getElement(resolvedTrigger);

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
    const dataAttributeName = props.dataAttributeName ?? DEFAULT_PROPS.dataAttributeName;
    const trigger = getElement(resolvedTrigger);

    createEffect(() => trigger.setAttribute(dataAttributeName, String(open())));

    onCleanup(() => trigger.removeAttribute(dataAttributeName));
  });

  return (
    <>
      {resolvedTrigger}
      <Show when={open()}>
        {(_) => {
          const resolvedContent = children(() => props.content);

          createEffect(() => {
            const trigger = getElement(resolvedTrigger);
            const content = getElement(resolvedContent, props.contentElementSelector);
            const anchorElement = props.anchorElement
              ? typeof props.anchorElement === "string"
                ? document.querySelector(props.anchorElement)
                : props.anchorElement
              : trigger;

            if (!(anchorElement instanceof HTMLElement)) throw new Error("Unable to find anchor element");

            // Hack for astro
            const contentToMount = getElement(resolvedContent);

            createEffect(() => {
              const closeOnOutsideInteraction =
                props.closeOnOutsideInteraction ?? DEFAULT_PROPS.closeOnOutsideInteraction;

              if (!closeOnOutsideInteraction) return;

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
              const mount = props.mount;
              if (!mount) return;

              const mountElement = getMountElement(mount);

              mountElement.appendChild(contentToMount);
              onCleanup(() => contentToMount.remove());
            });

            createEffect(() => {
              if (!props.usePopoverAPI) return;

              const isPopoverSupported = checkPopoverSupport();

              if (isPopoverSupported) {
                const popoverId = createUniqueId();

                trigger.setAttribute("popovertarget", popoverId);
                content.setAttribute("popover", "manual");
                content.setAttribute("id", `popover-${popoverId}`);

                if (!content.matches(":popover-open")) content.showPopover();

                onCleanup(() => trigger.removeAttribute("popovertarget"));
              } else {
                const mount = props.popoverAPIMountFallback;
                if (!mount) return;

                const mountElement = getMountElement(mount);

                mountElement.appendChild(contentToMount);
                onCleanup(() => contentToMount.remove());
              }
            });

            // Listen to escape key down to close popup
            createEffect(() => {
              const closeOnEscape = props.closeOnEscape ?? DEFAULT_PROPS.closeOnEscape;

              if (!closeOnEscape) return;

              const handleKeydown = (e: KeyboardEvent) => {
                if (e.key !== "Escape") return;

                // if content is not in the event path, return
                if (e.target instanceof HTMLElement && !content.contains(e.target) && !trigger.contains(e.target))
                  return;

                // if uncontrolled, close popover
                if (props.open === undefined) setOpen(false);
                props.onOpenChange?.(false);
              };

              document.addEventListener("keydown", handleKeydown);
              onCleanup(() => document.removeEventListener("keydown", handleKeydown));
            });

            createEffect(() => {
              const options = props.computePositionOptions;

              const updatePosition = () => {
                // for correct placement we need to set width of content before computing position
                // You may consider adding 'width: max-content' by yourself
                // @see https://floating-ui.com/docs/computePosition
                if (props.sameWidth) content.style.width = `${anchorElement.clientWidth}px`;

                computePosition(anchorElement, content, options).then(({ x, y }) => {
                  content.style.top = `${y}px`;
                  content.style.left = `${x}px`;
                  content.style.position = options?.strategy ?? DEFAULT_PROPS.computePositionOptions.strategy;
                });
              };

              updatePosition();

              createEffect(() => {
                if (!props.autoUpdate) return;

                const cleanupAutoupdate = autoUpdate(anchorElement, content, updatePosition, props.autoUpdateOptions);

                onCleanup(() => cleanupAutoupdate());
              });
            });
          });

          return resolvedContent();
        }}
      </Show>
    </>
  );
};
