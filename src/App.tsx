import { flip } from "@floating-ui/dom";

import { Popover } from "./lib";

import "./App.css";

function App() {
  let anchorRef: HTMLDivElement | undefined;

  return (
    <div style="display: flex; flex-direction: column; gap: 4rem; align-items: center; justify-content: center; height: 100dvh;">
      <div ref={anchorRef} id="anchor-element">
        anchor
      </div>
      <button id="trigger-button">Toggle popover</button>
      <Popover
        defaultOpen
        // You can pass selector or element
        triggerElement="#trigger-button"
        // You can pass selector or element
        anchorElement={anchorRef}
        // ------------------------------- The following props are optional
        // Full control over position
        autoUpdate
        computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
        dataAttributeName="data-open"
        contentElementSelector="div"
        onComputePosition={console.log}
      >
        <div>
          <button autofocus>hi</button>
          This div is visible when popover is open!
        </div>
      </Popover>
    </div>
  );
}

export default App;
