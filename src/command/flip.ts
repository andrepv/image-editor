import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";

export class FlipCommand implements Command {
  name: CommandName = "flip";
  constructor(private flip: () => Promise<void>) {}

  async execute(): Promise<void> {
    await this.toggleFlip();
  }

  async undo(): Promise<void> {
    await this.toggleFlip();
  }

  @disableHistoryRecording
  @preventScaleReset
  private async toggleFlip(): Promise<void> {
    try {
      await this.flip();
    } catch (error) {
      console.error(error);
    }
  }
}