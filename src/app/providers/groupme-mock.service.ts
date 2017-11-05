import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { GroupmeService } from "./groupme.service";
import { HttpClient } from "@angular/common/http";
import { Chat } from "../models/chat";

@Injectable()
export class GroupmeMockService extends GroupmeService {
  constructor(http: HttpClient) {
    super(http);
  }

  private FAKE_GROUPS: Group[] = [
    new Group(1, "Family"),
    new Group(2, "Roommates"),
    new Group(3, "Brunch Club"),
    new Group(4, "Ski Trip"),
    new Group(5, "Superfriends"),
    new Group(6, "California Coast")
  ];

  private FAKE_CHATS: Chat[] = [
      new Chat(5),
      new Chat(6),
      new Chat(1)
  ];

  getGroups(): Promise<Group[]> {
    return Promise.resolve(this.FAKE_GROUPS);
  }

  getChats(): Promise<Chat[]> {
    return Promise.resolve(this.FAKE_CHATS);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred in Groupme Mock Service: ', error);
    return Promise.reject(error.message || error);
  }
}