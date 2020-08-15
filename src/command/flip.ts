import imageStore from "../stores/imageStore";
import { Command, CommandName } from "./commandHistory";

export class FlipCommand implements Command {
  public name: CommandName = "flip";
  constructor(private flip: () => Promise<void>) {}

  public async execute(): Promise<void> {
    this.toggleFlip();
  }

  public async undo(): Promise<void> {
    this.toggleFlip();
  }

  private async toggleFlip(): Promise<void> {
    try {
      imageStore.preventAddingCommandsToHistory();
      await this.flip();
      imageStore.resumeAddingCommandsToHistory();
    } catch (error) {
      console.error(error);
    }
  }
}