import { Member } from "./member";
import { Message } from "./message";
import { Model } from "./model.interface";

export class Group implements Model {
  public id: number = 0;
  public name: string;
  public type: string;
  public description: string;
  public image_url: string;
  public creator_user_id: number = 0;
  public created_at: number = 0;
  public updated_at: number = 0;
  public share_url: string;
  public max_members: number = 0;
  public office_mode: boolean;
  public phone_number: string;
  public members: Member[];
  public messages: Message[];
  public owner: Member;

  public hasNotification: boolean = false;
  public muted: boolean = false;

  constructor() {
    this.members = [];
    this.messages = [];
  }

  public fields: string[] = [
    "id", "name", "type", "description", "image_url", "creator_user_id", "created_at", "updated_at", "share_url",
    "max_members", "office_mode", "phone_number", "members", "messages", "muted", "owner"
  ];

  public static storeKey: string = "groups";
}
