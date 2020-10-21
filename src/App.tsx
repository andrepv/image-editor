import React from "react";
import Menu from "./components/Menu";
import Header from "./components/Header/Header";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";

const App = () => {
  return (
    <div className="app">
      <Header />
      <Menu />
      <Toolbar/>
      <Canvas />
    </div>
  );
};

export default App;