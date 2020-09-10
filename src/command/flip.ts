import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";

export class FlipCommand implements Command {
  name: CommandName = "flip";
  constructor(private flip: () => void) {}

  execute(): void {
    this.toggleFlip();
  }

  undo(): void {
    this.toggleFlip();
  }

  @disableHistoryRecording
  @preventScaleReset
  private toggleFlip(): void {
    try {
      this.flip();
    } catch (error) {
      console.error(error);
    }
  }
}