import React from "react";
import { ReactComponent as Crop } from "../assets/crop.svg";
import { ReactComponent as Flip } from "../assets/flip.svg";
import { ReactComponent as Draw } from "../assets/pencil.svg";
import { ReactComponent as Text } from "../assets/text.svg";
import { ReactComponent as Filter } from "../assets/filter.svg";
import { ReactComponent as Search } from "../assets/search.svg";
import Tooltip from "./Tooltip";
import useStore from "../hooks/useStore";
import { useObserver } from "mobx-react";

interface IMenuItems {
  icon: React.ReactElement;
  name: string;
  handler: () => void;
  tooltip?: string;
}

const Menu: React.FC = () => {
  const { toolbarStore, canvasStore, imageStore } = useStore();
  const handleClick = (modeName: string) => {
    if (!imageStore.url && modeName !== "Search") {
      return;
    }
    imageStore.resetScale();
    toolbarStore.toggle(modeName);
    canvasStore.setMode(modeName.toLowerCase());
  };
  const items: IMenuItems[] = [
    {
      icon: <Search />,
      name: "Search",
      handler: () => handleClick("Search"),
      tooltip: "Upload an image from Unsplash",
    },
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
    {
      icon: <Text />,
      name: "Text",
      handler: () => handleClick("Text"),
    },
    {
      icon: <Filter />,
      name: "Filters",
      handler: () => handleClick("Filters"),
    },
  ];
  return useObserver(() => (
    <section className="menu">
      {items.map((item, index) => {
        const tooltip = item.tooltip || item.name;
        return (
          <Tooltip key={index} content={tooltip} placement="right">
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