import React from "react";
import { useObserver } from "mobx-react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import Menu from "./components/Menu";
import Header from "./components/Header/Header";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar/Toolbar";
import ZoomControl from "./components/ZoomControl";
import useStore from "./hooks/useStore";

const App: React.FC = () => {
  const { UIStore } = useStore();
  return useObserver(() => (
    <div className={`app ${UIStore.isToolbarOpen ? "toolbar_open": ""}`}>
      <Header />
      <Menu />
      <TransitionGroup component={null}>
        {UIStore.isToolbarOpen && (
          <CSSTransition
            timeout={600}
            classNames="toolbar"
          >
            <Toolbar/>
          </CSSTransition>
        )}
        <Canvas />
      </TransitionGroup>
      <ZoomControl />
    </div>
  ));
};

export default App;