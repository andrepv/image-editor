import { Command, CommandName } from "./commandHistory";
import { preventScaleReset } from "../helpers/decorators";
import rootStore from "../stores/rootStore";

export class RotationCommand implements Command {
  name: CommandName = "rotate";

  constructor(
    private prevAngle: number,
    private angle: number,
    private prevBaseScale: number,
    private baseScale: number,
  ) {}

  @preventScaleReset
  execute(): void {
    rootStore.canvasStore.rotate(this.angle);
    rootStore.canvasStore.setBaseScale(this.baseScale);
  }

  @preventScaleReset
  undo(): void {
    rootStore.canvasStore.rotate(this.prevAngle);
    rootStore.canvasStore.setBaseScale(this.prevBaseScale);
  }
}