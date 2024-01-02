import { Popover } from "./lib";

import "./App.css";
import { flip } from "@floating-ui/dom";

function App() {
  return (
    <Popover
      // Minimalistic
      // You'll only see <button>Toggle popover</button> in DOM
      trigger={<button id="trigger-button">Toggle popover</button>}
      content={<div>This div is visible when popover is open!</div>}
      // ------------------------------- The following props are optional
      // Only one DOM wrapper over content
      contentWrapperClass="content-wrapper-class"
      // Full control over position
      autoUpdate
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      // Popover API support (where possible)
      usePopoverAPI
      // Highly customizable
      ignoreOutsideInteraction
      dataAttributeName="data-open"
      // Astro support! Will work in Astro ignoring astro-slot wrapper
      anchorElementSelector="trigger-button"
      // SSR support
      mount="body"
      
    />
  );
}

export default App;
