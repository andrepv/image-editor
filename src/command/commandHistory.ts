import rootStore from "../stores/rootStore";

export type CommandName = (
  "crop"
  | "effect"
  | "flip"
  | "rotate"
  | "add_object"
  | "remove_object"
  | "set_image"
);

export interface Command {
  name: CommandName;
  execute: () => Promise<void> | void;
  undo: () => Promise<void> | void;
}

const DEBUG = true;

export class History {
  isHistoryCommandExecuted: boolean = false;
  private history: Command[] = [];
  private currentCommandIndex: number = -1;
  private canUndo: boolean = false;
  private canRedo: boolean = false;
  private canAddCommands: boolean = true;
  private readonly MAX_HISTORY_LENGTH: number = 50;

  push(command: Command): void {
    if (!this.canAddCommands) {
      return;
    }

    this.history.splice(
      this.currentCommandIndex + 1,
      this.history.length,
      command,
    );

    if (this.history.length > this.MAX_HISTORY_LENGTH) {
      this.history.shift();
    }

    this.setCurrentCommandIndex(this.history.length - 1);

    if (DEBUG) {
      console.log("push");
      console.log(this.history);
    }
  }

  async undo(): Promise<void> {
    const currentCommand = this.history[this.currentCommandIndex];
    if (currentCommand) {
      const nextCommandIndex = this.currentCommandIndex - 1;
      this.setCurrentCommandIndex(nextCommandIndex);
      await currentCommand.undo();

      if (DEBUG) {
        console.log("undo");
      }
    }
  }

  async redo(): Promise<void> {
    if (this.canRedo) {
      const nextCommandIndex = this.currentCommandIndex + 1;
      const currentCommand = this.history[nextCommandIndex];
      this.setCurrentCommandIndex(nextCommandIndex);
      await currentCommand.execute();

      if (DEBUG) {
        console.log("redo");
      }
    }
  }

  clear(): void {
    this.history = [];
    this.setCurrentCommandIndex(-1);
  }

  disableRecording(): void {
    this.canAddCommands = false;
  }

  enableRecording(): void {
    this.canAddCommands = true;
  }

  get isRecordingEnabled(): boolean {
    return this.canUndo;
  }

  private setCurrentCommandIndex(index: number): void {
    this.currentCommandIndex = index;
    this.canUndo = index >= 0;
    this.canRedo = index + 1 <= this.history.length - 1;
    rootStore.UIStore.updateHistoryButtons(this.canUndo, this.canRedo);
  }
}