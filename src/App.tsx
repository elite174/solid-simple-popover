import { Popover } from "./lib";

import "./App.css";
import { flip } from "@floating-ui/dom";

function App() {
  return (
    <Popover
      // Minimalistic
      as="button"
      // Awesome typings
      type="button"
      onClick={() => console.log("button clicked")}
      // Full control over position
      autoUpdate
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      // Popover API support (where possible)
      usePopoverAPI
      content={<div>This div is visible when popover is open!</div>}
      // Only one DOM wrapper over content
      contentWrapperClass="content-wrapper-class"
      // Highly customizable
      ignoreOutsideInteraction
    >
      Toggle popover
    </Popover>
  );
}

export default App;
