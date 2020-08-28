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
import { ModeName } from "../stores/appStore";

interface IMenuItems {
  icon: React.ReactElement;
  name: ModeName;
  handler: () => void;
  tooltip?: string;
}

const Menu: React.FC = () => {
  const { appStore, imageStore } = useStore();

  const handleClick = (modeName: ModeName) => {
    if (!imageStore.url && modeName !== "search") {
      return;
    }

    appStore.toggleToolbar(modeName);

    if (appStore.mode && imageStore.scale !== 1) {
      if (appStore.mode !== "search") {
        imageStore.setScale(1);
      }
    }

    if (!appStore.mode) {
      imageStore.resetToBaseScale();
    }
  };

  const items: IMenuItems[] = [
    {
      icon: <Search />,
      name: "search",
      handler: () => handleClick("search"),
      tooltip: "Upload an image from Unsplash",
    },
    {
      icon: <Crop />,
      name: "crop",
      handler: () => handleClick("crop"),
    },
    {
      icon: <Flip />,
      name: "rotate",
      handler: () => handleClick("rotate"),
    },
    {
      icon: <Draw />,
      name: "drawing",
      handler: () => handleClick("drawing"),
    },
    {
      icon: <Text />,
      name: "text",
      handler: () => handleClick("text"),
    },
    {
      icon: <Filter />,
      name: "filters",
      handler: () => handleClick("filters"),
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
                appStore.mode === item.name ? "menu__item_active" : ""
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