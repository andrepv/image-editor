import { observable, action } from "mobx";

export class SearchStore {
  @observable public images: any[] = [];
  @observable public currentPage: number = 1;
  @observable public totalPages: number = 0;
  @observable public isLoading: boolean = false;
  @observable public isError: boolean = false;
  @observable public keyword: string = "beach";
  @observable public isLoaded: boolean = false;

  @action public setKeyword(keyword: string): void {
    this.keyword = keyword;
  }

  @action public goToPage(pageNum: number): void {
    this.currentPage = pageNum;
  }

  @action public showLoader(): void {
    this.isLoading = true;
  }

  @action public showError(): void {
    this.isLoading = false;
    this.isError = true;
  }

  @action public loadImages(images: any[], totalPages: number): void {
    this.images = images;
    this.totalPages = totalPages;
    this.isLoading = false;
    this.isError = false;
    if (!this.isLoaded) {
      this.isLoaded = true;
    }
  }
}

export default new SearchStore();