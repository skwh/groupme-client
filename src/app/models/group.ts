import {Member} from "./member";
import {Message} from "./message";

export class Group {
  id: number;
  name: string;
  type: string;
  description: string;
  image_url: string;
  creator_user_id: number;
  created_at: number;
  updated_at: number;
  share_url: string;
  max_members: number;
  office_mode: boolean;
  phone_number: string;
  members: Member[];
  messages: Message[];

  constructor() {}

  static fields: string[] = [
    "id", "name", "type", "description", "image_url", "creator_user_id", "created_at", "updated_at", "share_url",
    "max_members", "office_mode", "phone_number", "members", "messages"
  ];
}
