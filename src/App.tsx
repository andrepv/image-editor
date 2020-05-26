import React from "react";
import Menu from "./components/Menu";
import Header from "./components/Header";
import Canvas from "./components/Canvas";

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <Menu />
      <Canvas />
    </div>
  );
};

export default App;