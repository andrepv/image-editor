import React, { useEffect, useRef, useState } from "react";
import Gallery, { PhotoProps, PhotoClickHandler } from "react-photo-gallery";

import { useUnsplashAPI, Image } from "../helpers/useUnsplashAPI";
import { ReactComponent as Search } from "../assets/search2.svg";
import { ReactComponent as Loader } from "../assets/loader.svg";

type Props = {
  close: () => void;
}

const UnsplashGallery: React.FC<Props> = ({close}) => {
  const [{
    images,
    isLoading,
    isError,
    currentPage,
    totalPages,
  }, {
    loadImages,
    goToNextPage,
    goToPrevPage,
  }] = useUnsplashAPI();
  const [inputValue, setInputValue] = useState("");
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (!galleryRef || !galleryRef.current) {
      return;
    }
    const target = event.target as HTMLElement;
    if (!galleryRef.current.contains(target)) {
      close();
    }
  };

  const handleImageClick: PhotoClickHandler = (event, photos) => {
    // temporarily
    console.log(images[photos.index].regularUrl);
  };

  const galleryPhotoProp: PhotoProps[] = images.map((image: Image) => {
    return {
      width: image.width,
      height: image.height,
      src: image.thumbUrl,
    };
  });

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });

  return (
    <div
      ref={galleryRef}
      className="unsplash-gallery__container"
    >
      <div className="unsplash-gallery custom-scrollbar">
        <form
          className="unsplash-gallery__form"
          onSubmit={
            event => {
              loadImages(inputValue);
              event.preventDefault();
            }
          }
        >
          <button
            type="submit"
            className="unsplash-gallery__submit-btn"
          >
            <Search />
          </button>
          <input
            className="unsplash-gallery__input"
            type="text"
            value={inputValue}
            onChange={event => setInputValue(event.target.value)}
            placeholder="What are you looking for?"
          />
        </form>
        {images.length && !isError ? (
        <div className="unsplash-gallery__pagination">
          {currentPage !== 1 && (
            <button
              className="unsplash-gallery__prev-btn"
              onClick={goToPrevPage}
            >
              Previous
            </button>
          )}
          {currentPage !== totalPages && (
            <button
              className="unsplash-gallery__next-btn"
              onClick={goToNextPage}
            >
              Next
            </button>
          )}
        </div>
        ) : null}
        {isError && (
          <div className="unsplash-gallery__error">
            Something went wrong ...
          </div>
        )}
        {isLoading
        ? <div className="unsplash-gallery__loader"><Loader/></div>
        : images.length
          ? <Gallery photos={galleryPhotoProp} onClick={handleImageClick}/>
          : <div className="unsplash-gallery__error">No results</div>
        }
      </div>
    </div>
  );
};

export default UnsplashGallery;