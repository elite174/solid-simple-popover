import { Popover } from "./lib";

import "./App.css";

function App() {
  return (
    <main>
      <Popover triggerElement={<button>click</button>}>
        <span>hi</span>
      </Popover>
    </main>
  );
}

export default App;
