import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";
import rootStore from "../stores/rootStore";

export class FilterImageCommand implements Command {
  name: CommandName = "filter";
  private filterName: string = rootStore.imageStore.filterName;
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
      await rootStore.imageStore.addFilter(filterName);
    } catch (error) {
      console.error(error);
    }
  }
}