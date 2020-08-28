import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";

export class RemoveObjectFromCanvasCommand implements Command {
  name: CommandName = "remove_object";

  constructor(
    private object: fabric.Object,
    private addObjToCanvas: (object: fabric.Object) => void,
    private removeObjFromCanvas: (object: fabric.Object) => void,
  ) {}

  async execute(): Promise<void> {
    this.removeObjFromCanvas(this.object);
  }

  @disableHistoryRecording
  async undo(): Promise<void> {
    this.addObjToCanvas(this.object);
  }
}