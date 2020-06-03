import React from "react";
import { useObserver } from "mobx-react";
import useStore from "../helpers/useStore";

const Toolbar: React.FC = () => {
  const { toolbarStore } = useStore();
  return useObserver(() => (
    <section className="toolbar">
      <p>{toolbarStore.type}</p>
    </section>
  ));
};

export default Toolbar;