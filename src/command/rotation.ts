import { Command, CommandName } from "./commandHistory";
import imageStore from "../stores/imageStore";
import { preventScaleReset } from "../helpers/decorators";

export class RotationCommand implements Command {
  name: CommandName = "rotate";

  constructor(
    private prevAngle: number,
    private angle: number,
    private prevBaseScale: number,
    private baseScale: number,
  ) {}

  @preventScaleReset
  async execute(): Promise<void> {
    imageStore.setAngle(this.angle);
    imageStore.setBaseScale(this.baseScale);
  }

  @preventScaleReset
  async undo(): Promise<void> {
    imageStore.setAngle(this.prevAngle);
    imageStore.setBaseScale(this.prevBaseScale);
  }
}