import { Model } from "./model.interface";

export class Member implements Model {
  user_id: number;
  nickname: string;
  muted: boolean;
  image_url: string;

  public fields: ["user_id", "name", "muted", "image_url"];

  constructor () {}
}