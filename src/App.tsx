import { Popover } from "./lib";

import "./App.css";
import { createSignal } from "solid-js";

function App() {
  const [open, setOpen] = createSignal(false);

  return (
    <main id="12" style={{ position: "relative" }}>
      <Popover
        triggerTag="input"
        placeholder="Input some value"
        autoUpdate
        computePositionOptions={{ strategy: "absolute" }}
        usePopoverAPI
      >
        <span>hi</span>
      </Popover>
    </main>
  );
}

export default App;
