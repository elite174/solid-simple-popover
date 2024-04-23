import { Popover } from "./lib";

import "./App.css";
import { flip } from "@floating-ui/dom";

function App() {
  let anchorRef: HTMLDivElement | undefined;

  return (
    <div style="display: flex; flex-direction: column; gap: 4rem; align-items: center; justify-content: center; height: 100dvh;">
      <div ref={anchorRef} id="anchor-element">
        anchor
      </div>
      <Popover
        defaultOpen
        // Minimalistic
        // You'll only see <button data-open="false" id="trigger-button">Toggle popover</button> in DOM
        trigger={<button id="trigger-button">Toggle popover</button>}
        // No wrapper nodes!
        content={
          <div>
            <button autofocus>hi</button>
            This div is visible when popover is open!
          </div>
        }
        // ------------------------------- The following props are optional
        // Full control over position
        autoUpdate
        computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
        // Popover API support (where possible)
        // When popover API is not supported, fallback to mounting content to body
        //popoverAPIMountFallback="body"
        dataAttributeName="data-open"
        // SSR support
        //mount="body"
        anchorElement={anchorRef}
        contentElementSelector="div"
      />
    </div>
  );
}

export default App;
