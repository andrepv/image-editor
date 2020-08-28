import imageStore from "../stores/imageStore";
import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";

export class FilterImageCommand implements Command {
  name: CommandName = "filter";
  private filterName: string = imageStore.filter.name;
  constructor(private prevFilterName: string) {}

  async execute(): Promise<void> {
    await this.addFilter(this.filterName);
  }

  async undo(): Promise<void> {
    await this.addFilter(this.prevFilterName);
  }

  @disableHistoryRecording
  private async addFilter(filterName: string): Promise<void> {
    try {
      await imageStore.addFilter(filterName);
    } catch (error) {
      console.error(error);
    }
  }
}