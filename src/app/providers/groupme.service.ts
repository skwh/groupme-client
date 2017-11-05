import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { HttpClient } from "@angular/common/http";
import "rxjs/add/operator/toPromise";

const BASE_URL = "https://api.groupme.com/v3";

@Injectable()
export class GroupmeService {
  constructor(private http: HttpClient) {}

  getGroups(token: string): Promise<Group[]>  {
    const url = this.safeGetApiURL('groups', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          this.MakeGroupsFromJson(response["response"])
        )
        .catch(this.handleError);
  }

  getChats(token: string): Promise<Chat[]> {
    const url = this.safeGetApiURL('chats', token);
    return this.http.get(url)
        .toPromise()
        .then(response =>
          console.log(response)
        ).catch(this.handleError);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred in Groupme Service: ', error);
    return Promise.reject(error.message || error);
  }

  private safeGetApiURL(endpoint: string, token: string): string {
    return `${BASE_URL}/${endpoint}?token=${token}`;
  }

  private MakeGroupsFromJson(json: Object[]): Group[] {
    let groups: Group[] = [];
    for (let i=0; i < json.length; i++) {
      let currentObject = json[i];
      let newGroup = new Group(-1, "");
      for (let j=0; j<Group.fields.length;j++) {
        let field = Group.fields[j];
        if (currentObject.hasOwnProperty(field)) {
          newGroup[field] = currentObject[field];
        }
      }
      groups.push(newGroup);
    }
    return groups;
  }
}