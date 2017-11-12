import { Member } from "./member";
import { Model } from "./model.interface";

export class Message implements Model {
  public avatar_url: string;
  public conversation_id: number;
  public source_guid: string;
  public created_at: number;
  public group_id: number;
  public name: string;
  public system: boolean;
  public favorited_by: Member[];

  constructor(public text: string, public user_id: number) {}

  fields: string[] = [
      "image_url", "source_guid", "created_at", "group_id",
      "name", "avatar_url", "system", "favorited_by", "text", "user_id"
  ];
}