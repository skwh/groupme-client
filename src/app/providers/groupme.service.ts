import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/toPromise";
import { Message } from "../models/message";
import { Model } from "../models/model.interface";
import { Member } from "../models/member";

const BASE_URL = "https://api.groupme.com/v3";
const IMAGE_SERVICE_URL = "https://image.groupme.com/";

@Injectable()
export class GroupmeService {
  constructor(private http: HttpClient) {}

  getGroups(token: string, page?: number, per_page?: number, omit_memberships: boolean = false): Promise<Group[]>  {
    const url = GroupmeService.safeGetApiURL('groups', token, [
        ["page", ""+page],
        ["per_page", ""+per_page],
        ["omit", (omit_memberships)? "memberships" : ""]
    ]);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Group, response["response"])
        )
        .catch(this.handleError);
  }

  getGroup(token: string, group_id: number): Promise<Group> {
    const url = GroupmeService.safeGetApiURL(`groups/${group_id}`, token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeSingleTfromJson(Group, response["response"])
        )
        .catch(this.handleError);
  }

  getFormerGroups(token: string): Promise<Group[]> {
    const url = GroupmeService.safeGetApiURL('groups/former', token);
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

  createNewGroup(token: string, name: string, description?: string, image_url?: string, share?: boolean): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL('groups', token);
    return this.http.post(url, GroupmeService.safeGetPostBody([
        ['name', name],
        ['description', description],
        ['image_url', image_url],
        ['share', ""+share]
    ])).toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  updateGroup(token: string, group_id: number, new_name?: string, new_description?:string, new_image_url?: string, office_mode?: boolean, share?: boolean): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`groups/${group_id}/update`, token);
    return this.http.post(url, GroupmeService.safeGetPostBody([
        ['name', new_name],
        ['description', new_description],
        ['image_url', new_image_url],
        ['office_mode', ""+office_mode],
        ['share', ""+share],
    ])).toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  destroyGroup(token: string, group_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`groups/${group_id}/destroy`, token);
    return this.http.post(url, {})
        .toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  rejoinGroup(token: string, group_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL('groups/join', token);
    return this.http.post(url, {'group_id': group_id})
        .toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  changeOwner(token: string, group_id: number, user_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL('groups/change_owners', token);
    const request_body = GroupmeService.safeGetPostBody([
        ["group_id", ""+group_id],
        ["user_id", ""+user_id]
    ]);
    return this.http.post(url, { "requests": [request_body]})
        .toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  removeUserFromGroup(token: string, group_id: number, membership_id: number): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`groups/${group_id}/members/${membership_id}/remove`, token);
    return this.http.post(url, {})
        .toPromise()
        .then(response => {
          return true;
        })
        .catch(this.handleError);
  }

  getChats(token: string, page?: number, per_page?: number): Promise<Chat[]> {
    const url = GroupmeService.safeGetApiURL('chats', token, [
        ['page', ""+page],
        ['per_page', ""+per_page]
    ]);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          GroupmeService.MakeTfromJson(Chat, response["response"])
        ).catch(this.handleError);
  }

  getDirectMessages(token: string, user_id: number, before_id?: number, since_id?: number): Promise<Message[]> {
    const url = GroupmeService.safeGetApiURL('direct_messages', token, [
        ['other_user_id', user_id.toString()],
        ['before_id', ""+before_id],
        ['since_id', ""+since_id]
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

  sendMessageToGroup(token: string, message: Message): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL(`groups/${message.conversation_id}/messages`, token);
    return this.http.post(url, { "message": message })
        .toPromise()
        .then(response => { return true })
        .catch(this.handleError);
  }

  sendMessageToUser(token: string, message: Message): Promise<boolean> {
    const url = GroupmeService.safeGetApiURL('direct_messages', token);
    return this.http.post(url, { "direct_message" : message })
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

  uploadImage(token: string, image_data: Blob): Promise<string> {
    const url = GroupmeService.safeGetApiURL('pictures', token, [], IMAGE_SERVICE_URL);
    return this.http.post(url, image_data)
        .toPromise()
        .then(response => {
          return response["payload"]["picture_url"];
        })
        .catch(this.handleError);
  }

  private static safeGetApiURL(endpoint: string, token: string, parameters?:string[][], base_url: string = BASE_URL): string {
    let params_string = "";
    if (parameters) {
      for (let i = 0; i < parameters.length; i++) {
        if (parameters[i][1] != "undefined") {
          params_string += `&${parameters[i][0]}=${parameters[i][1]}`;
        }
      }
    }
    return `${base_url}/${endpoint}?token=${token}${params_string}`;
  }

  private static safeGetPostBody(parameters: string[][]): Object {
    let returnObject = {};
    for (let i=0;i<parameters.length;i++) {
      if (parameters[i][1] != "undefined") {
        returnObject[parameters[i][0]] = parameters[i][1];
      }
    }
    return returnObject;
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