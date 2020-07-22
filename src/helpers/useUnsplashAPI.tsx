import { useEffect } from "react";
import Unsplash, { toJson } from "unsplash-js";
import { accessKey } from "../appConstants";
import useStore from "./useStore";
import { autorun } from "mobx";

export type Image = {
  url: string;
  width: number;
  height: number;
}

const unsplash = new Unsplash({accessKey});

const useUnsplashAPI = () => {
  const {searchStore} = useStore();

  const updatePage = (pageNum: number) => {
    setTimeout(() => {
      searchStore.goToPage(pageNum);
    }, 200);
  };
  const goToNextPage = () => updatePage(searchStore.currentPage + 1);
  const goToPrevPage = () => updatePage(searchStore.currentPage - 1);
  const loadImages = (inputValue: string) => {
    const value = inputValue.trim();
    if (value.length > 2) {
      searchStore.setKeyword(inputValue);
      searchStore.goToPage(1);
    }
  };

  useEffect(() => {
    if (searchStore.isLoaded) {
      return;
    }
    autorun(() => {
      const {currentPage, keyword} = searchStore;
      const fetchData = async () => {
        try {
          searchStore.showLoader();

          const response = await unsplash.search.photos(
            keyword, currentPage, 10,
          );
          const data = await toJson(response);
          const images: Image[] = data.results.map((item: any) => {
            return {
              url: item.urls.regular,
              width: item.width,
              height: item.height,
            };
          });
          searchStore.loadImages(images, data.total_pages);
        } catch (e) {
          searchStore.showError();
        }
      };
      if (keyword.length > 2) {
        fetchData();
      }
    });
  }, []);

  return {
    loadImages,
    goToNextPage,
    goToPrevPage,
  };
};

export default useUnsplashAPI;