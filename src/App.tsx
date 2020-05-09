import React from "react";
import Menu from "./components/Menu";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <Menu />
    </div>
  );
};

export default App;