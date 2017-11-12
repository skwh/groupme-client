import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/toPromise";
import { Message } from "../models/message";
import { Model } from "../models/model.interface";

const BASE_URL = "https://api.groupme.com/v3";

@Injectable()
export class GroupmeService {
  constructor(private http: HttpClient) {}

  getGroups(token: string): Promise<Group[]>  {
    const url = this.safeGetApiURL('groups', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          this.MakeTfromJson(Group, response["response"])
        )
        .catch(this.handleError);
  }

  getGroupMessages(token: string, group_id: number): Promise<Message[]> {
    const url = this.safeGetApiURL(`groups/${group_id}/messages`, token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          this.MakeTfromJson(Message, response["response"]["messages"])
        ).catch(this.handleError);
  }

  getChats(token: string): Promise<Chat[]> {
    const url = this.safeGetApiURL('chats', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          this.MakeTfromJson(Chat, response["response"])
        ).catch(this.handleError);
  }

  getDirectMessages(token: string, user_id: number, before_id?: number, since_id?: number): Promise<Message[]> {
    const url = this.safeGetApiURL('direct_messages', token, [
        ['other_user_id', ""+user_id]
    ]);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          this.MakeTfromJson(Message, response["response"]["direct_messages"])
        ).catch(this.handleError);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred in Groupme Service: ', error);
    return Promise.reject(error.message || error);
  }

  private safeGetApiURL(endpoint: string, token: string, parameters?:string[][]): string {
    let params_string = "";
    if (parameters) {
      for (let i = 0; i < parameters.length; i++) {
        params_string += `&${parameters[i][0]}=${parameters[i][1]}`;
      }
    }
    return `${BASE_URL}/${endpoint}?token=${token}${params_string}`;
  }

  private MakeTfromJson<T extends Model>(tClass: { new (...args: any[]): T }, json: Object[]): T[] {
    let objects: T[] = [];
    for (let i=0;i<json.length;i++) {
      let currentObject = json[i];
      let newObject = new tClass();
      for (let j=0;j<newObject.fields.length;j++) {
        let field = newObject.fields[j];
        if (currentObject.hasOwnProperty(field)) {
          newObject[field] = currentObject[field];
        }
      }
      objects.push(newObject);
    }
    return objects;
  }
}