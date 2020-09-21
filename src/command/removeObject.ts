import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";

export class RemoveObjectCommand implements Command {
  name: CommandName = "remove_object";

  constructor(
    private object: fabric.Object,
    private addObjToCanvas: (object: fabric.Object) => void,
    private removeObjFromCanvas: (object: fabric.Object) => void,
  ) {}

  execute(): void {
    this.removeObjFromCanvas(this.object);
  }

  @disableHistoryRecording
  undo(): void {
    this.addObjToCanvas(this.object);
  }
}