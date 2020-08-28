import { Command, CommandName } from "./commandHistory";

export class setImageCommand implements Command {
  name: CommandName = "set_image";

  constructor(
    private prevImageUrl: string,
    private imageUrl: string,
    private setImage: (url: string) => Promise<void>,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.setImage(this.imageUrl);
    } catch (error) {
      console.error(error);
    }
  }

  async undo(): Promise<void> {
    try {
      await this.setImage(this.prevImageUrl);
    } catch (error) {
      console.error(error);
    }
  }
}