import { useEffect, useState, useReducer } from "react";
import Unsplash, { toJson } from "unsplash-js";
import { accessKey } from "../appConstants";

export type Image = {
  thumbUrl: string;
  regularUrl: string;
  width: number;
  height: number;
}

type State = {
  isLoading: boolean;
  isError: boolean;
  images: Image[];
  totalPages: number;
}

type Action =
 | {type: "pending"}
 | {type: "success", payload: {images: Image[]; totalPages: number}}
 | {type: "error"};

const unsplash = new Unsplash({accessKey});

const initialState = {
  isLoading: false,
  isError: false,
  images: [],
  totalPages: 0,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "pending":
      return {
        ...state,
        isLoading: true,
      };
    case "success":
      return {
        isLoading: false,
        isError: false,
        images: action.payload.images,
        totalPages: action.payload.totalPages,
      };
    case "error":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
}

export const useUnsplashAPI = ():
  [
    State & {currentPage: number},
    {
      loadImages: (inputValue: string) => void;
      goToNextPage: () => void;
      goToPrevPage: () => void;
    }
  ] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [keyword, setKeyword] = useState("beach");
  const [currentPage, goToPage] = useState(1);
  const togglePage = (pageNum: number) => {
    setTimeout(() => {
      goToPage(pageNum);
    }, 200);
  };
  const goToNextPage = () => togglePage(currentPage + 1);
  const goToPrevPage = () => togglePage(currentPage - 1);
  const loadImages = (inputValue: string) => {
    const value = inputValue.trim();
    if (value.length > 2) {
      setKeyword(inputValue);
      goToPage(1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({type: "pending"});

        const response = await unsplash.search.photos(
          keyword, currentPage, 10, {orientation: "portrait"},
        );
        const data = await toJson(response);
        const images: Image[] = data.results.map((item: any) => {
          return {
            thumbUrl: item.urls.thumb,
            regularUrl: item.urls.regular,
            width: item.width,
            height: item.height,
          };
        });
        dispatch({
          type: "success",
          payload: {
            images,
            totalPages: data.total_pages,
          },
        });
      } catch (e) {
        dispatch({type: "error"});
      }
    };
    if (keyword.length > 2) {
      fetchData();
    }
  }, [keyword, currentPage]);
  return [{
    ...state,
    currentPage,
  }, {
    loadImages,
    goToNextPage,
    goToPrevPage,
  }];
};