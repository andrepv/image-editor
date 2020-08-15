import { Command, CommandName } from "./commandHistory";
import imageStore from "../stores/imageStore";

export class RotationCommand implements Command {
  public name: CommandName = "rotate";

  constructor(
    private prevAngle: number,
    private angle: number,
  ) {}

  public execute(): void {
    imageStore.setAngle(this.angle);
  }

  public undo(): void {
    imageStore.setAngle(this.prevAngle);
  }
}