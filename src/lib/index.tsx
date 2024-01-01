import { autoUpdate, computePosition, type ComputePositionConfig, type AutoUpdateOptions } from "@floating-ui/dom";
import {
  type Accessor,
  type ComponentProps,
  type JSXElement,
  type JSX,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  createUniqueId,
  createComputed,
  on,
  splitProps,
} from "solid-js";
import { Dynamic } from "solid-js/web";

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
  /** Use popover API where possible */
  usePopoverAPI?: boolean;
  onOpenChange?: (open: boolean) => void;
  getAPI?: (api: PopoverAPI) => void;
} & (
  | {
      // autoUpdate option for floating-ui
      autoUpdate?: false;
      autoUpdateOptions?: never;
    }
  | { autoUpdate: true; autoUpdateOptions?: AutoUpdateOptions }
);

export type PopoverProps<T extends keyof JSX.IntrinsicElements> = ComponentProps<T> & PopoverBaseProps<T>;

// Remove this when Firefox supports Popover API
const checkPopoverSupport = () => HTMLElement.prototype.hasOwnProperty("popover");

const getElement = (elementRef: Accessor<HTMLElement | undefined>) => {
  const element = elementRef();
  if (!element) throw new Error("HTML element element not found");

  return element;
};

const EXCLUDED_PROPS = [
  "triggerContent",
  "open",
  "defaultOpen",
  "sameWidth",
  "computePositionOptions",
  "triggerClass",
  "triggerStyles",
  "triggerTag",
  "contentWrapperClass",
  "contentWrapperStyles",
  "contentWrapperTag",
  "usePopoverAPI",
  "onOpenChange",
  "autoUpdate",
  "autoUpdateOptions",
  "children",
  "triggerEvent",
  "getAPI",
] satisfies (keyof PopoverBaseProps<any>)[];

export const Popover = <T extends keyof JSX.IntrinsicElements = "button">(initialProps: PopoverProps<T>) => {
  const [props, componentProps] = splitProps(initialProps, EXCLUDED_PROPS);
  const [triggerElementRef, setTriggerElementRef] = createSignal<HTMLElement>();
  const [contentElementRef, setContentElementRef] = createSignal<HTMLElement>();
  const [open, setOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  const handleTrigger = () => {
    const newOpenValue = !open();
    // if uncontrolled, set open state
    if (props.open === undefined) setOpen(newOpenValue);
    props.onOpenChange?.(newOpenValue);
  };

  const api: PopoverAPI = {
    getContentWrapperElement: () => contentElementRef(),
    getTriggerElement: () => triggerElementRef(),
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

  // provide API on mount
  createEffect(
    on(
      () => props.getAPI,
      (getAPI) => getAPI?.(api)
    )
  );

  createEffect(() => {
    const event = props.triggerEvent === undefined ? "pointerdown" : props.triggerEvent;
    if (!event) return;

    const trigger = getElement(triggerElementRef);
    trigger.addEventListener(event, handleTrigger);

    onCleanup(() => trigger.removeEventListener(event, handleTrigger));
  });

  return (
    <>
      {/** @ts-ignore Weak ts types */}
      <Dynamic
        {...componentProps}
        component={props.triggerTag ?? "button"}
        ref={setTriggerElementRef}
        class={props.triggerClass}
        style={props.triggerStyles}
        data-expanded={open()}
      >
        {props.triggerContent}
      </Dynamic>
      <Show when={open()}>
        {(_) => {
          const popoverId = createUniqueId();
          const shouldUsePopoverAPI = () => props.usePopoverAPI && checkPopoverSupport();

          createEffect(() => {
            if (shouldUsePopoverAPI()) {
              getElement(triggerElementRef).setAttribute("popovertarget", popoverId);

              onCleanup(() => getElement(triggerElementRef).removeAttribute("popovertarget"));
            }
          });

          createEffect(() => {
            const trigger = getElement(triggerElementRef);
            const content = getElement(contentElementRef);

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
            const trigger = getElement(triggerElementRef);
            const content = getElement(contentElementRef);

            if (shouldUsePopoverAPI()) {
              content.setAttribute("popover", "manual");
              content.setAttribute("id", `popover-${popoverId}`);
              if (!content.matches(":popover-open")) content.showPopover();
            } else {
              document.body.appendChild(content);
              onCleanup(() => content.remove());
            }

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
              component={props.contentWrapperTag ?? "div"}
              class={props.contentWrapperClass}
              style={props.contentWrapperStyles}
              ref={setContentElementRef}
            >
              {props.children}
            </Dynamic>
          );
        }}
      </Show>
    </>
  );
};
