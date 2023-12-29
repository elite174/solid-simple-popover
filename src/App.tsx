import { flip } from "@floating-ui/dom";

import { Popover } from "./lib";

import "./App.css";

function App() {
  return (
    <Popover
      defaultOpen
      triggerElement={<button>click</button>}
      computePositionOptions={{ placement: "bottom-start", middleware: [flip()] }}
      autoUpdate
      usePopoverAPI
    >
      <input type="text" />
    </Popover>
  );
}

export default App;
