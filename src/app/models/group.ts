import { Member } from "./member";
import { Message } from "./message";

export class Group {
  public type: string;
  public description: string;
  public image_url: string;
  public creator_user_id: number;
  public created_at: number;
  public updated_at: number;
  public share_url: string;
  public max_members: number;
  public office_mode: boolean;
  public phone_number: string;
  public members: Member[];
  public messages: Message[];

  constructor(public id: number, public name: string) {}

  static fields: string[] = [
    "id", "name", "type", "description", "image_url", "creator_user_id", "created_at", "updated_at", "share_url",
    "max_members", "office_mode", "phone_number", "members", "messages"
  ];
}
