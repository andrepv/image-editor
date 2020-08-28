import appStore from "../stores/appStore";

const DEBUG = true;

export type CommandName = (
  "crop"
  | "filter"
  | "flip"
  | "rotate"
  | "add_object"
  | "remove_object"
  | "set_image"
);

export interface Command {
  name: CommandName;
  execute: () => Promise<void>;
  undo: () => Promise<void>;
}

export interface IHistory {
  push: (command: Command) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => void;
  disableRecording: () => void;
  enableRecording: () => void;
  removeCommands: (name: CommandName) => void;
  isRecordingEnabled: boolean;
}

export class History implements IHistory {
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

  removeCommands(name: CommandName): void {
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
    appStore.updateHistoryButtons(this.canUndo, this.canRedo);
  }
}

export const history = new History();