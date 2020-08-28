import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";

export class AddObjectToCanvasCommand implements Command {
  name: CommandName = "add_object";

  constructor(
    private object: fabric.Object,
    private addObjToCanvas: (object: fabric.Object) => void,
    private removeObjFromCanvas: (object: fabric.Object) => void,
  ) {}

  @disableHistoryRecording
 async execute(): Promise<void> {
    this.addObjToCanvas(this.object);
  }

  async undo(): Promise<void> {
    this.removeObjFromCanvas(this.object);
  }
}