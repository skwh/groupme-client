import { Model } from "./model.interface";

export class Attachment implements Model {
  public type: string;
  public url: string;
  public loci: number[];
  public user_ids: number[];

  public fields: string[] = [
      "type", "url", "loci", "user_ids"
  ];
}