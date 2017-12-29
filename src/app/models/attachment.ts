import { Model } from "./model.interface";

export enum AttachmentType {
  Image = "image",
  Location = "location",
  Split = "split",
  Emoji = "emoji",
  Mention = "mentions",
}

export class Attachment implements Model {
  public type: AttachmentType;
  public url: string;
  public loci: number[];
  public user_ids: number[];

  public fields: string[] = [
      "type", "url", "loci", "user_ids"
  ];

  constructor() {
    this.loci = [];
    this.user_ids = [];
  }
}
