import { Popover } from "./lib";

import "./App.css";

function App() {
  let anchorRef: HTMLDivElement | undefined;

  return (
    <div style="display: flex; flex-direction: column; gap: 8rem; align-items: center; justify-content: center; height: 200dvh;">
      <div ref={anchorRef} id="anchor-element">
        anchor asd asd
      </div>
      <button id="trigger-button">Toggle popover</button>
      <Popover
        defaultOpen
        // You can pass selector or element
        triggerElement="#trigger-button"
        // You can pass selector or element
        anchorElement={anchorRef}
        dataAttributeName="data-open"
        contentElementSelector="div"
        targetPositionArea="bottom center"
        positionTryFallbacks={(anchorName) => [`${anchorName} flip-block`]}
        positionVisibility="anchors-visible"
      >
        <div style={{}}>
          <button autofocus>hi</button>
          This div is visible when popover is open!
        </div>
      </Popover>
    </div>
  );
}

export default App;
