import { Member } from "./member";
import { Message } from "./message";
import { Model } from "./model.interface";

export class Chat implements Model {
  [index: number]: string;
  public created_at: number;
  public updated_at: number;
  public other_user: Member;
  public last_message: Message;

  public hasNotification: boolean;

  constructor(public messages_count: number) {}

  public fields: string[] = [
      "created_at", "updated_at", "other_user", "last_message", "messages_count"
  ];

  public static storeKey: string = "chats";
}