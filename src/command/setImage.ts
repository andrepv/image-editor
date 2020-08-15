import { Command, CommandName } from "./commandHistory";

export class setImageCommand implements Command {
  public name: CommandName = "set_image";

  constructor(
    private prevImageUrl: string,
    private imageUrl: string,
    private setImage: (url: string) => void,
  ) {}

  public execute(): void {
    this.setImage(this.imageUrl);
  }

  public undo(): void {
    this.setImage(this.prevImageUrl);
  }
}