import imageStore from "../stores/imageStore";
import { Command, CommandName } from "./commandHistory";

export class FilterImageCommand implements Command {
  public name: CommandName = "filter";
  private filterName: string = imageStore.filter.name;
  constructor(private prevFilterName: string) {}

  public async execute(): Promise<void> {
    this.addFilter(this.filterName);
  }

  public async undo(): Promise<void> {
    this.addFilter(this.prevFilterName);
  }

  private async addFilter(filterName: string): Promise<void> {
    try {
      imageStore.preventAddingCommandsToHistory();
      await imageStore.addFilter(filterName);
      imageStore.resumeAddingCommandsToHistory();
    } catch (error) {
      console.error(error);
    }
  }
}