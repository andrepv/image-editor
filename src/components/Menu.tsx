import React from "react";
import { ReactComponent as Crop } from "../assets/crop.svg";
import { ReactComponent as Flip } from "../assets/flip.svg";
import { ReactComponent as Draw } from "../assets/pencil.svg";
import { ReactComponent as Shapes } from "../assets/shapes.svg";
import { ReactComponent as Text } from "../assets/text.svg";
import { ReactComponent as Filter } from "../assets/filter.svg";

interface IMenuItems {
  icon: React.ReactElement;
  name: string;
}

const Menu: React.FC = () => {
  const items: IMenuItems[] = [
    {icon: <Crop />, name: "Crop"},
    {icon: <Flip />, name: "Flip"},
    {icon: <Draw />, name: "Draw"},
    {icon: <Shapes />, name: "Shapes"},
    {icon: <Text />, name: "Text"},
    {icon: <Filter />, name: "Filter"},
  ];
  return (
    <section className="menu">
      {items.map(item => {
        return (
          <div className="menu__item">
            {item.icon}
          </div>
        );
      })}
    </section>
  );
};

export default Menu;