import {Command, CommandName} from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";
import rootStore from "../stores/rootStore";

export class RemoveObjectCommand implements Command {
  name: CommandName = "remove_object";

  constructor(private object: fabric.Object) {}

  execute(): void {
    rootStore.canvasStore.instance.remove(this.object);
  }

  @disableHistoryRecording
  undo(): void {
    rootStore.canvasStore.instance.add(this.object);
  }
}