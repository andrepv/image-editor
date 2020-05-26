import React, { useState } from "react";

import { ReactComponent as Search } from "../assets/search.svg";
import UnsplashGallery from "./UnsplashGallery";
import Tooltip from "./Tooltip";

const SearchButton: React.FC = () => {
  const [isGalleryOpen, toggleGallery] = useState(false);
  const closeGallery = () => toggleGallery(false);
  return (
    <>
      <Tooltip content="Upload an image from Unsplash" placement="bottom">
        <Search
          className="header__search"
          onClick={() => toggleGallery(!isGalleryOpen)}
        />
      </Tooltip>
      {isGalleryOpen && <UnsplashGallery close={closeGallery} />}
    </>
  );
};

export default SearchButton;