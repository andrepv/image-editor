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
    const {effects} = rootStore.imageStore;
    effects.setValues(this.previousValues);
    effects.savedValues = this.previousValues;
  }

  execute(): void {
    const {effects} = rootStore.imageStore;
    effects.setValues(this.currentValues);
    effects.savedValues = this.currentValues;
  }
}