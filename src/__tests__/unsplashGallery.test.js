import React from "react";
import ReactDOM from "react-dom";
import { shallow, mount } from "enzyme";

import SearchButton from "../components/SearchButton";
import UnsplashGallery from "../components/UnsplashGallery";
import Menu from "../components/Menu";
import useUnsplashAPI from "../helpers/useUnsplashAPI";

jest.mock("../helpers/useUnsplashAPI");

const data = {
  images: [],
  isLoading: false,
  isError: false,
  currentPage: 1,
  totalPages: 2,
  loadImages: jest.fn(),
  goToNextPage: jest.fn(),
  goToPrevPage: jest.fn(),
};

const images = [{
  url: "",
  width: 20,
  height: 20,
}];

describe("<UnsplashGallery />", () => {
  useUnsplashAPI.mockReturnValue(data);

  it("a click on the search button should toggle the gallery", () => {
    const wrapper = mount(<SearchButton />);
    expect(wrapper.find(".unsplash-gallery__container").length).toBe(0);
    wrapper.find("svg.header__search").simulate("click");
    expect(wrapper.find(".unsplash-gallery__container").length).toBe(1);
    wrapper.find("svg.header__search").simulate("click");
    expect(wrapper.find(".unsplash-gallery__container").length).toBe(0);
  });

  it("a click outside the gallery should close it", () => {
    const map = {};

    document.addEventListener = jest.fn((event, cb) => {
      map[event] = cb;
    });

    const props = {
      close: jest.fn(),
    };

    const menu = mount(<Menu />);
    const wrapper = mount(<UnsplashGallery {... props} />);

    map.click({
      target: ReactDOM.findDOMNode(menu.getDOMNode()),
    });
    expect(props.close).toHaveBeenCalledTimes(1);

    map.click({
      target: ReactDOM.findDOMNode(wrapper.getDOMNode()),
    });
    expect(props.close).toHaveBeenCalledTimes(1);
  });

  it("should display a message when there are no images", () => {
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__error")).toHaveLength(1);
    expect(wrapper.find(".unsplash-gallery__error").text()).toBe("No results");

    expect(wrapper.find(".unsplash-gallery__navbar")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__photos")).toHaveLength(0);
  });

  it("when loading images, the loader should be displayed", () => {
    useUnsplashAPI.mockReturnValue({...data, isLoading: true});
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__loader")).toHaveLength(1);

    expect(wrapper.find(".unsplash-gallery__navbar")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__photos")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__error")).toHaveLength(0);
  });

  it("should display an error message if something goes wrong", () => {
    useUnsplashAPI.mockReturnValue({...data, isError: true});
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);

    const errorElement = wrapper.find(".unsplash-gallery__error");
    expect(errorElement).toHaveLength(1);
    expect(errorElement.text()).toBe("Something went wrong ...");

    expect(wrapper.find(".unsplash-gallery__loader")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__navbar")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__photos")).toHaveLength(0);
  });

  it("should display images", () => {
    useUnsplashAPI.mockReturnValue({
      ...data,
      images,
      currentPage: 1,
      totalPages: 2,
    });
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__photos")).toHaveLength(1);
    expect(wrapper.find(".unsplash-gallery__navbar")).toHaveLength(1);
    expect(wrapper.find(".unsplash-gallery__prev-btn")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__next-btn")).toHaveLength(1);
  });

  it("shouldn't display the navbar if there is only one page", () => {
    useUnsplashAPI.mockReturnValue({
      ...data,
      images,
      currentPage: 1,
      totalPages: 1,
    });
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__prev-btn")).toHaveLength(0);
    expect(wrapper.find(".unsplash-gallery__next-btn")).toHaveLength(0);
  });

  it(`both buttons of the navbar should be displayed if the previous 
  and next page exist`, () => {
    useUnsplashAPI.mockReturnValue({
      ...data,
      images,
      currentPage: 2,
      totalPages: 3,
    });
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__prev-btn")).toHaveLength(1);
    expect(wrapper.find(".unsplash-gallery__next-btn")).toHaveLength(1);
  });

  it("a click on the navbar buttons should call appropriate functions",
  () => {
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    wrapper.find(".unsplash-gallery__prev-btn").simulate("click");
    expect(data.goToPrevPage).toHaveBeenCalledTimes(1);
    wrapper.find(".unsplash-gallery__next-btn").simulate("click");
    expect(data.goToNextPage).toHaveBeenCalledTimes(1);
  });

  it("shouldn't display the 'next' button if the current page is the last",
  () => {
    useUnsplashAPI.mockReturnValue({
      ...data,
      images,
      currentPage: 3,
      totalPages: 3,
    });
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(wrapper.find(".unsplash-gallery__prev-btn")).toHaveLength(1);
    expect(wrapper.find(".unsplash-gallery__next-btn")).toHaveLength(0);
  });

  it("should pass an input value to the loadImages function", () => {
    const wrapper = shallow(<UnsplashGallery close={jest.fn()}/>);
    wrapper.find(".unsplash-gallery__input").simulate("change", {
      target: {value: "test"},
    });
    expect(wrapper.find(".unsplash-gallery__input").prop("value"))
    .toEqual("test");

    wrapper.find(".unsplash-gallery__form").simulate("submit", {
      preventDefault: jest.fn(),
    });
    expect(data.loadImages).toHaveBeenCalledWith("test");
  });

  it("should match the snapshot", () => {
    useUnsplashAPI.mockReturnValue({...data, images});
    const component = shallow(<UnsplashGallery close={jest.fn()}/>);
    expect(component.html()).toMatchSnapshot();
  });
});