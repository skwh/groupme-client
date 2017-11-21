import { Model } from "./model.interface";

export class Member implements Model {
  public id: number;
  public name: string;
  public muted: boolean;
  public image_url: string;
  public phone_number: string;
  public created_at: number;
  public updated_at: number;
  public email: string;
  public sms: boolean;

  public fields: string[] = ["id", "name", "muted", "image_url", "phone_number", "created_at", "updated_at", "email", "sms"];

  constructor () {}
}