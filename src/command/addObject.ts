import { Command, CommandName } from "./commandHistory";
import imageStore from "../stores/imageStore";

export class AddObjectToCanvasCommand implements Command {
  public name: CommandName = "add_object";

  constructor(
    private object: fabric.Object,
    private addObjToCanvas: (object: fabric.Object) => void,
    private removeObjFromCanvas: (object: fabric.Object) => void,
  ) {}

  public execute(): void {
    imageStore.preventAddingCommandsToHistory();
    this.addObjToCanvas(this.object);
    setTimeout(() => imageStore.resumeAddingCommandsToHistory(), 500);
  }

  public undo(): void {
    this.removeObjFromCanvas(this.object);
  }
}