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
      // Full control over position
      autoUpdate
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      // Popover API support (where possible)
      usePopoverAPI
      // Highly customizable
      sameWidth
      ignoreOutsideInteraction
      dataAttributeName="data-open"
      // SSR support
      mount="body"
      // Astro support
      anchorElementSelector="#trigger-button"
      contentElementSelector="div"
    />
  );
}

export default App;
