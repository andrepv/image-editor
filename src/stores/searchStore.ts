import { observable, action } from "mobx";
import { RootStore } from "./rootStore";

export class SearchStore {
  @observable images: any[] = [];
  @observable currentPage: number = 1;
  @observable totalPages: number = 0;
  @observable isLoading: boolean = false;
  @observable isError: boolean = false;
  @observable keyword: string = "dark";
  @observable isLoaded: boolean = false;

  constructor(public root: RootStore) {}

  @action setKeyword(keyword: string): void {
    this.keyword = keyword;
  }

  @action goToPage(pageNum: number): void {
    this.currentPage = pageNum;
  }

  @action showLoader(): void {
    this.isLoading = true;
  }

  @action showError(): void {
    this.isLoading = false;
    this.isError = true;
  }

  @action loadImages(images: any[], totalPages: number): void {
    this.images = images;
    this.totalPages = totalPages;
    this.isLoading = false;
    this.isError = false;
    if (!this.isLoaded) {
      this.isLoaded = true;
    }
  }
}