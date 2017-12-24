import { Model } from "./model.interface";

export class Member implements Model {
  public user_id: number;
  public name: string;
  public nickname: string;
  public muted: boolean;
  public image_url: string;
  public phone_number: string;
  public created_at: number;
  public updated_at: number;
  public email: string;
  public sms: boolean;

  public fields: string[] = ["user_id", "name", "nickname", "muted", "image_url", "phone_number", "created_at", "updated_at", "email", "sms"];

  constructor () {}

  public static storeKey: string = "members";

  public static userStoreKey: string = "me";
}