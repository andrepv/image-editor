import { Command, CommandName } from "./commandHistory";
import imageStore from "../stores/imageStore";

export class RemoveObjectFromCanvasCommand implements Command {
  public name: CommandName = "remove_object";

  constructor(
    private object: fabric.Object,
    private addObjToCanvas: (object: fabric.Object) => void,
    private removeObjFromCanvas: (object: fabric.Object) => void,
  ) {}

  public execute(): void {
    this.removeObjFromCanvas(this.object);
  }

  public undo(): void {
    imageStore.preventAddingCommandsToHistory();
    this.addObjToCanvas(this.object);
    setTimeout(() => imageStore.resumeAddingCommandsToHistory(), 500);
  }
}