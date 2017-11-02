import {Member} from "./member";

export class Message {
  text: string;
  image_url: string;
  source_guid: string;
  created_at: number;
  user_id: number;
  group_id: number;
  name: string;
  avatar_url: string;
  system: boolean;
  favorited_by: Member[];
}