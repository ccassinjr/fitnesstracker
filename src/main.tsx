import { useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl == null) {
  throw new Error("Missing root element");
}

// @ts-expect-error
function ExampleApp() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return <h1 onClick={() => setIsOpen(false)}> IS OPEN </h1>;
  } else {
    return <h1 onClick={() => setIsOpen(true)}> IS CLOSED </h1>;
  }
}

createRoot(rootEl).render(<App />);
