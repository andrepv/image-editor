import {Command, CommandName} from "./commandHistory";
import rootStore from "../stores/rootStore";
import { EffectValue } from "../stores/effectsStore";

export class EffectCommand implements Command {
  name: CommandName = "effect";

  constructor(
    private previousValues: EffectValue[],
    private currentValues: EffectValue[],
  ) {}

  undo(): void {
    this.setEffect(this.previousValues);
  }

  execute(): void {
    this.setEffect(this.currentValues);
  }

  setEffect(values: EffectValue[]): void {
    const {effects} = rootStore.imageStore;
    effects.setValues(values);
    effects.savedValues = values;
  }
}