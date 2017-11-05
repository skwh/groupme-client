import { Member } from "./member";
import { Message } from "./message";

export class Chat {
  public created_at: number;
  public updated_at: number;
  public other_user: Member;
  public last_message: Message;

  constructor(public messages_count: number) {}

  static fields: string[] = [
      "created_at", "updated_at", "other_user", "last_message", "messages_count"
  ];
}