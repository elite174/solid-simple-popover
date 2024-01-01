import { Popover } from "./lib";

import "./App.css";
import { createSignal } from "solid-js";

function App() {
  const [open, setOpen] = createSignal(false);

  return (
    <main>
      <Popover
        open={open()}
        triggerTag="input"
        placeholder="Input some value"
        // Don't trigger popover with pointerdown event
        triggerEvent={null}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <span>hi</span>
      </Popover>
      <div id="12"></div>
    </main>
  );
}

export default App;
