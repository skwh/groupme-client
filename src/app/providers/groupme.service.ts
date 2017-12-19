import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/toPromise";
import { Message } from "../models/message";
import { Model } from "../models/model.interface";
import { Member } from "../models/member";

const BASE_URL = "https://api.groupme.com/v3";

@Injectable()
export class GroupmeService {
  constructor(private http: HttpClient) {}

  getGroups(token: string): Promise<Group[]>  {
    const url = GroupmeService.safeGetApiURL('groups', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Group, response["response"])
        )
        .catch(this.handleError);
  }

  getGroupMessages(token: string, group_id: number, before_id?: number): Promise<Message[]> {
    const url = GroupmeService.safeGetApiURL(`groups/${group_id}/messages`, token, [
        ['before_id', ""+before_id]
    ]);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Message, response["response"]["messages"])
        ).catch(this.handleError);
  }

  getChats(token: string): Promise<Chat[]> {
    const url = GroupmeService.safeGetApiURL('chats', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Chat, response["response"])
        ).catch(this.handleError);
  }

  getDirectMessages(token: string, user_id: number, before_id?: number, since_id?: number): Promise<Message[]> {
    const url = GroupmeService.safeGetApiURL('direct_messages', token, [
        ['other_user_id', user_id.toString()]
    ]);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Message, response["response"]["direct_messages"])
        ).catch(this.handleError);
  }

  getMe(token: string): Promise<Member> {
    const url = GroupmeService.safeGetApiURL('users/me', token);
    return this.http.get(url)
        .toPromise()
        .then( response => {
          return GroupmeService.MakeSingleTfromJson(Member, response["response"]);
        }).catch(this.handleError);
  }

  createLike(token: string, conversation_id: number, message_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`messages/${conversation_id}/${message_id}/like`, token);
    return this.http.post(url, null)
        .toPromise()
        .then(response => { return true })
        .catch(this.handleError);
  }

  destroyLike(token: string, conversation_id: number, message_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`messages/${conversation_id}/${message_id}/unlike`, token);
    return this.http.post(url, null)
        .toPromise()
        .then(response => { return true })
        .catch(this.handleError);
  }

  sendMessage(token: string, conversation_id: number, user_id: number, text: string, message_guid: string): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`groups/${conversation_id}/messages`, token);
    let sentMessage = new Message(text, user_id);
    sentMessage.group_id = conversation_id;
    sentMessage.source_guid = message_guid;
    return this.http.post(url, { "message": sentMessage })
        .toPromise()
        .then(response => { return true })
        .catch(this.handleError);
  }

  handleError(error: any): Promise<any> {
    if (error.status == 304) {
      console.log("Not modified");
      return Promise.reject("Not modified");
    } else {
      console.error('An error occurred in Groupme Service: ', error);
      return Promise.reject(error.message || error);
    }
  }

  private static safeGetApiURL(endpoint: string, token: string, parameters?:string[][]): string {
    let params_string = "";
    if (parameters) {
      for (let i = 0; i < parameters.length; i++) {
        if (parameters[i][1] != "undefined") {
          params_string += `&${parameters[i][0]}=${parameters[i][1]}`;
        }
      }
    }
    return `${BASE_URL}/${endpoint}?token=${token}${params_string}`;
  }

  private static MakeTfromJson<T extends Model>(tClass: { new (...args: any[]): T }, json: Object[]): T[] {
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

  private static MakeSingleTfromJson<T extends Model>(tClass: { new (...args: any[]): T }, json: Object): T {
    let newObject = new tClass();
    for (let j=0;j<newObject.fields.length;j++) {
      let field = newObject.fields[j];
      if (json.hasOwnProperty(field)) {
        newObject[field] = json[field];
      }
    }
    return newObject;
  }
}