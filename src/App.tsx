import { Popover } from "./lib";

import "./App.css";
import { flip } from "@floating-ui/dom";
import { createEffect, createSignal } from "solid-js";

function App() {
  const [contentWrapperRef, setContentWrapperRef] = createSignal<HTMLElement>();

  createEffect(() => console.log(contentWrapperRef()));

  return (
    <Popover
      trigger={<button>Toggle popover</button>}
      content={<div>This div is visible when popover is open!</div>}
      // Full control over position
      autoUpdate
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      // Popover API support (where possible)
      usePopoverAPI
      // Only one DOM wrapper over content
      contentWrapperClass="content-wrapper-class"
      // Highly customizable
      ignoreOutsideInteraction
      setContentWrapperRef={setContentWrapperRef}
    />
  );
}

export default App;
