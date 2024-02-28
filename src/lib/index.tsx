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
  /** Should content have the same width as trigger */
  sameWidth?: boolean;
  /** Options for floating-ui computePosition function */
  computePositionOptions?: ComputePositionConfig;
  /**
   * @default "pointerdown"
   * if set to null no event would trigger popover,
   * so you need to trigger it mannually
   */
  triggerEvent?: string | null;
  /**
   * HTMLElement or CSS selector (can be used in SSR) to mount popover content into
   */
  mount?: HTMLElement | string;
  /**
   * Ignore outside interaction when popover is open
   * By default when popover is open it will listen to "pointerdown" event outside of popover content and trigger
   */
  ignoreOutsideInteraction?: boolean;
  /**
   * Ignore "Escape" key press when popover is open
   * By default when popover is open it will listen to an "Escape" key "keydown" event
   */
  ignoreEscKeyPress?: boolean;
  /**
   * Data attribute name to set on trigger element
   * @default "data-popover-open"
   */
  dataAttributeName?: string;
  /**
   * CSS selector to find anchor html element inside trigger
   * Can be used with Astro, because astro wraps trigger element into astro-slot
   * and position breaks
   */
  anchorElementSelector?: string;
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
  /** Use popover API where possible */
  usePopoverAPI?: boolean;
  /**
   * HTMLElement or CSS selector (can be used in SSR) to mount popover content into
   * Fallback for browsers that don't support Popover API
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
  triggerEvent: "pointerdown",
  dataAttributeName: "data-popover-open",
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

  const handleTrigger = () => {
    const newOpenValue = !open();
    // if uncontrolled, set open state
    if (props.open === undefined) setOpen(newOpenValue);
    props.onOpenChange?.(newOpenValue);
  };

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
    const event = props.triggerEvent === undefined ? DEFAULT_PROPS.triggerEvent : props.triggerEvent;
    if (!event) return;

    const trigger = getElement(resolvedTrigger, props.anchorElementSelector);
    trigger.addEventListener(event, handleTrigger);

    onCleanup(() => trigger.removeEventListener(event, handleTrigger));
  });

  createEffect(() => {
    const dataAttributeName = props.dataAttributeName ?? DEFAULT_PROPS.dataAttributeName;
    const trigger = getElement(resolvedTrigger, props.anchorElementSelector);

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
            const trigger = getElement(resolvedTrigger, props.anchorElementSelector);
            const content = getElement(resolvedContent, props.contentElementSelector);
            // Hack for astro
            const contentToMount = getElement(resolvedContent);

            createEffect(() => {
              if (props.ignoreOutsideInteraction) return;

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
              if (props.ignoreEscKeyPress) return;

              const handleEscButtonPress = (e: KeyboardEvent) => {
                if (!(e.key === "Escape")) return;

                const content = getElement(resolvedContent, props.contentElementSelector);

                // if content is not in the event path, return
                if (e.target instanceof HTMLElement && !content.contains(e.target)) return;

                // if uncontrolled, close popover
                if (props.open === undefined) setOpen(false);
                props.onOpenChange?.(false);
              };

              document.addEventListener("keydown", handleEscButtonPress);
              onCleanup(() =>
                document.removeEventListener("keydown", handleEscButtonPress)
              );
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

            createEffect(() => {
              const options = props.computePositionOptions;

              const updatePosition = () => {
                // for correct placement we need to set width of content before computing position
                // You may consider adding 'width: max-content' by yourself
                // @see https://floating-ui.com/docs/computePosition
                if (props.sameWidth) content.style.width = `${trigger.clientWidth}px`;

                computePosition(trigger, content, options).then(({ x, y }) => {
                  content.style.top = `${y}px`;
                  content.style.left = `${x}px`;
                  content.style.position = options?.strategy ?? DEFAULT_PROPS.computePositionOptions.strategy;
                });
              };

              updatePosition();

              createEffect(() => {
                if (!props.autoUpdate) return;

                const cleanupAutoupdate = autoUpdate(trigger, content, updatePosition, props.autoUpdateOptions);

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
