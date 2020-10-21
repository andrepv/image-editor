import {Command, CommandName} from "./commandHistory";
import {
  preventScaleReset,
  disableHistoryRecording,
} from "../helpers/decorators";

export class FlipCommand implements Command {
  name: CommandName = "flip";

  constructor(private flip: () => void) {}

  @disableHistoryRecording
  @preventScaleReset
  execute(): void {
    this.flip();
  }

  @disableHistoryRecording
  @preventScaleReset
  undo(): void {
    this.flip();
  }
}