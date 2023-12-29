import { autoUpdate, computePosition, ComputePositionConfig, AutoUpdateOptions } from "@floating-ui/dom";
import {
  type ChildrenReturn,
  type ParentComponent,
  type JSXElement,
  type JSX,
  Show,
  children,
  createEffect,
  createSignal,
  onCleanup,
  createUniqueId,
  createComputed,
  on,
  Accessor,
  untrack,
} from "solid-js";
import { Dynamic } from "solid-js/web";

export type PopoverProps = {
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

// Remove this when Firefox supports Popover API
const checkPopoverSupport = () => HTMLElement.prototype.hasOwnProperty("popover");

const getTriggerElement = (triggerChild: ChildrenReturn) => {
  const triggerElement = triggerChild();

  if (!(triggerElement instanceof HTMLElement))
    throw new Error("Popover must have a trigger element of type HTMLElement");

  return triggerElement;
};

const getContentElement = (contentElementRef: Accessor<HTMLElement | undefined>) => {
  const content = contentElementRef();
  if (!content) throw new Error("Content element not found");

  return content;
};

export const Popover: ParentComponent<PopoverProps> = (props) => {
  const [contentElementRef, setContentElementRef] = createSignal<HTMLElement>();
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

  const resolvedTrigger = children(() => props.triggerElement);

  createEffect(() => {
    // if open is not defined, we need to handle the click event on the trigger (uncontrolled behavior)
    if (props.open === undefined) {
      const trigger = getTriggerElement(resolvedTrigger);

      const handleTriggerClick = () => {
        const newOpenValue = !open();
        // if uncontrolled, set open state
        if (props.open === undefined) setOpen(newOpenValue);
        props.onOpenChange?.(newOpenValue);
      };

      trigger.addEventListener("pointerdown", handleTriggerClick);
      onCleanup(() => trigger.removeEventListener("pointerdown", handleTriggerClick));
    }
  });

  createEffect(() => {
    const trigger = getTriggerElement(resolvedTrigger);

    trigger.setAttribute("data-expanded", String(open()));
  });

  return (
    <>
      {resolvedTrigger()}
      <Show when={open()}>
        {(_) => {
          const popoverId = createUniqueId();
          const shouldUsePopoverAPI = () => props.usePopoverAPI && checkPopoverSupport();

          createEffect(() => {
            if (shouldUsePopoverAPI()) {
              getTriggerElement(resolvedTrigger).setAttribute("popovertarget", popoverId);

              onCleanup(() => getTriggerElement(resolvedTrigger).removeAttribute("popovertarget"));
            }
          });

          createEffect(() => {
            const trigger = getTriggerElement(resolvedTrigger);
            const content = getContentElement(contentElementRef);

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
            const trigger = getTriggerElement(resolvedTrigger);
            const content = getContentElement(contentElementRef);

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

              const updatePosition = () =>
                computePosition(trigger, content, options).then(({ x, y }) => {
                  content.style.top = `${y}px`;
                  content.style.left = `${x}px`;
                  content.style.position = options?.strategy ?? "fixed";

                  if (props.sameWidth) content.style.width = `${trigger.clientWidth}px`;
                });

              updatePosition();

              createEffect(() => {
                if (!props.autoUpdate) return;

                const cleanupAutoupdate = autoUpdate(trigger, content, updatePosition, props.autoUpdateOptions);

                onCleanup(() => cleanupAutoupdate());
              });
            });
          });

          createEffect(() => {
            const content = getContentElement(contentElementRef);

            if (props.getContentWrapperElement)
              untrack(() => {
                props.getContentWrapperElement?.(content);
              });
          });

          return (
            <Dynamic
              component={props.childrenWrapperTag ?? "div"}
              class={props.childrenWrapperClass}
              style={props.childrenWrapperStyles}
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
