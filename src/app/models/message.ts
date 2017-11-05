import { Member } from "./member";

export class Message {
  public image_url: string;
  public source_guid: string;
  public created_at: number;
  public group_id: number;
  public name: string;
  public avatar_url: string;
  public system: boolean;
  public favorited_by: Member[];

  constructor(public text: string, public user_id: number) {}

  static fields: string[] = [
      "image_url", "source_guid", "created_at", "group_id",
      "name", "avatar_url", "system", "favorited_by", "text", "user_id"
  ];
}