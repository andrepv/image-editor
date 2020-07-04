import React from "react";
import { ReactComponent as Crop } from "../assets/crop.svg";
import { ReactComponent as Flip } from "../assets/flip.svg";
import { ReactComponent as Draw } from "../assets/pencil.svg";
import { ReactComponent as Shapes } from "../assets/shapes.svg";
import { ReactComponent as Text } from "../assets/text.svg";
import { ReactComponent as Filter } from "../assets/filter.svg";
import Tooltip from "./Tooltip";
import useStore from "../helpers/useStore";
import { useObserver } from "mobx-react";

interface IMenuItems {
  icon: React.ReactElement;
  name: string;
  handler: () => void;
}

const Menu: React.FC = () => {
  const { toolbarStore, canvasStore, imageStore } = useStore();
  const handleClick = (modeName: string) => {
    if (!imageStore.url) {
      return;
    }
    imageStore.resetScale();
    toolbarStore.toggle(modeName);
    canvasStore.setMode(modeName.toLowerCase());
  };
  const items: IMenuItems[] = [
    {
      icon: <Crop />,
      name: "Crop",
      handler: () => handleClick("Crop"),
    },
    {
      icon: <Flip />,
      name: "Rotate",
      handler: () => handleClick("Rotate"),
    },
    {
      icon: <Draw />,
      name: "Draw",
      handler: () => handleClick("Draw"),
    },
    {icon: <Shapes />, name: "Shapes", handler: () => {}},
    {icon: <Text />, name: "Text", handler: () => {}},
    {icon: <Filter />, name: "Filter", handler: () => {}},
  ];
  return useObserver(() => (
    <section className="menu">
      {items.map((item, index) => {
        return (
          <Tooltip key={index} content={item.name} placement="right">
            <div
              className={`menu__item ${
                toolbarStore.type === item.name ? "menu__item_active" : ""
              }`}
              onClick={item.handler}
            >
              {item.icon}
            </div>
          </Tooltip>
        );
      })}
    </section>
  ));
};

export default Menu;