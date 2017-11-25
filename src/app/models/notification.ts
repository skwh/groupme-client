import { Model } from "./model.interface";
import { Message } from "./message";

export class FayeNotification implements Model {
  public alert: string;
  public received_at: number;
  public subject: Message;
  public type: string;

  public fields: string[] = [
      "alert", "recieved_at", "subject", "type"
  ];
}