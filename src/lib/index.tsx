import { autoUpdate, computePosition, type ComputePositionConfig, type AutoUpdateOptions } from "@floating-ui/dom";
import {
  type Accessor,
  type JSXElement,
  type JSX,
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
import { Dynamic } from "solid-js/web";

export type PopoverProps = {
  /** HTML Element which triggers popover */
  trigger: JSXElement;
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
  /**
   * Data attribute name to set on trigger element
   * @default "data-popover-open"
   */
  dataAttributeName?: string;
  onOpenChange?: (open: boolean) => void;
  setContentWrapperRef?: (wrapperElement: HTMLElement) => void;
} & (
  | {
      // autoUpdate option for floating-ui
      autoUpdate?: false;
      autoUpdateOptions?: undefined;
    }
  | { autoUpdate: true; autoUpdateOptions?: AutoUpdateOptions }
);

// Remove this when Firefox supports Popover API
const checkPopoverSupport = () => HTMLElement.prototype.hasOwnProperty("popover");

const getTriggerElement = (resolvedTrigger: ChildrenReturn): HTMLElement => {
  const trigger = resolvedTrigger();
  if (!(trigger instanceof HTMLElement)) throw new Error("Trigger must be an HTML element");

  return trigger;
};

const getElement = (elementRef: Accessor<HTMLElement | undefined>) => {
  const element = elementRef();
  if (!element) throw new Error("HTML element element not found");

  return element;
};

const DEFAULT_PROPS = Object.freeze({
  as: "button",
  triggerEvent: "pointerdown",
  contentWrapperTag: "div",
  dataAttributeName: "data-popover-open",
}) satisfies Partial<PopoverProps>;

export const Popover: VoidComponent<PopoverProps> = (props) => {
  const [contentElementRef, setContentElementRef] = createSignal<HTMLElement>();
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
    const contentElement = contentElementRef();

    if (contentElement) props.setContentWrapperRef?.(contentElement);
  });

  createEffect(() => {
    const event = props.triggerEvent === undefined ? DEFAULT_PROPS.triggerEvent : props.triggerEvent;
    if (!event) return;

    const trigger = getTriggerElement(resolvedTrigger);
    trigger.addEventListener(event, handleTrigger);

    onCleanup(() => trigger.removeEventListener(event, handleTrigger));
  });

  createEffect(() => {
    const dataAttributeName = props.dataAttributeName ?? DEFAULT_PROPS.dataAttributeName;
    const trigger = getTriggerElement(resolvedTrigger);

    createEffect(() => trigger.setAttribute(dataAttributeName, String(open())));

    onCleanup(() => trigger.removeAttribute(dataAttributeName));
  });

  return (
    <>
      {resolvedTrigger()}
      <Show when={open()}>
        {(_) => {
          const shouldUsePopoverAPI = () => props.usePopoverAPI && checkPopoverSupport();

          createEffect(() => {
            const trigger = getTriggerElement(resolvedTrigger);
            const content = getElement(contentElementRef);

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
              if (!props.mount) return;

              props.mount.appendChild(content);
              onCleanup(() => content.remove());
            });

            createEffect(() => {
              if (!shouldUsePopoverAPI()) return;

              const popoverId = createUniqueId();

              trigger.setAttribute("popovertarget", popoverId);
              content.setAttribute("popover", "manual");
              content.setAttribute("id", `popover-${popoverId}`);

              if (!content.matches(":popover-open")) content.showPopover();

              onCleanup(() => trigger.removeAttribute("popovertarget"));
            });

            createEffect(() => {
              const options = props.computePositionOptions;

              const updatePosition = () => {
                // for correct placement we need to set width of content before computing position
                // @see https://floating-ui.com/docs/computePosition
                content.style.width = props.sameWidth ? `${trigger.clientWidth}px` : "max-content";

                computePosition(trigger, content, options).then(({ x, y }) => {
                  content.style.top = `${y}px`;
                  content.style.left = `${x}px`;
                  content.style.position = options?.strategy ?? "fixed";
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

          return (
            <Dynamic
              component={props.contentWrapperTag ?? DEFAULT_PROPS.contentWrapperTag}
              class={props.contentWrapperClass}
              style={props.contentWrapperStyles}
              ref={setContentElementRef}
            >
              {props.content}
            </Dynamic>
          );
        }}
      </Show>
    </>
  );
};
