import canvasStore from "../stores/canvasStore";

const DEBUG = false;

export type CommandName = (
  "crop" |
  "filter" |
  "flip" |
  "rotate" |
  "add_object" |
  "remove_object" |
  "set_image"
);

export interface Command {
  name: CommandName;
  execute: () => void;
  undo: () => void;
}

export class CommandHistory {
  private history: Command[] = [];
  private currentCommandIndex: number = -1;
  private isUndoCommandAvailable: boolean = false;
  private isRedoCommandAvailable: boolean = false;
  private readonly MAX_HISTORY_LENGTH: number = 50;

  public push(command: Command) {
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

  public undo(): void {
    const currentCommand = this.history[this.currentCommandIndex];
    if (currentCommand) {
      const nextCommandIndex = this.currentCommandIndex - 1;
      this.setCurrentCommandIndex(nextCommandIndex);
      currentCommand.undo();

      if (DEBUG) {
        console.log("undo");
      }
    }
  }

  public redo(): void {
    if (this.isRedoCommandAvailable) {
      const nextCommandIndex = this.currentCommandIndex + 1;
      const currentCommand = this.history[nextCommandIndex];
      this.setCurrentCommandIndex(nextCommandIndex);
      currentCommand.execute();

      if (DEBUG) {
        console.log("redo");
      }
    }
  }

  public clearHistory(): void {
    this.history = [];
    this.setCurrentCommandIndex(-1);
  }

  public removeCommands(name: CommandName): void {
    if (!name || !this.history) {
      return;
    }
    this.history = this.history.filter(command => command.name !== name);
    if (this.currentCommandIndex + 1 > this.history.length) {
      this.setCurrentCommandIndex(this.history.length - 1);
    }

    if (DEBUG) {
      console.log("remove commands");
      console.log(this.history);
    }
  }

  private setCurrentCommandIndex(index: number): void {
    this.currentCommandIndex = index;
    this.isUndoCommandAvailable = index >= 0;
    this.isRedoCommandAvailable = index + 1 <= this.history.length - 1;
    canvasStore.updateHistoryButtons(
      this.isUndoCommandAvailable,
      this.isRedoCommandAvailable,
    );
  }
}

export const commandHistory = new CommandHistory();