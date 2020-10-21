import { Command, CommandName } from "./commandHistory";
import { disableHistoryRecording } from "../helpers/decorators";
import rootStore from "../stores/rootStore";

export class AddObjectCommand implements Command {
  name: CommandName = "add_object";

  constructor(private object: fabric.Object) {}

  @disableHistoryRecording
  execute(): void {
    rootStore.canvasStore.instance.add(this.object);
  }

  undo(): void {
    rootStore.canvasStore.instance.remove(this.object);
  }
}