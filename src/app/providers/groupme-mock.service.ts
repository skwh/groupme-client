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
    new Group(),
    new Group(),
    new Group(),
    new Group(),
    new Group(),
    new Group()
  ];

  private FAKE_CHATS: Chat[] = [
      new Chat(5),
      new Chat(6),
      new Chat(1)
  ];

  getGroups(token: string): Promise<Group[]> {
    return Promise.resolve(this.FAKE_GROUPS);
  }

  getChats(token: string): Promise<Chat[]> {
    return Promise.resolve(this.FAKE_CHATS);
  }

  handleError(error: any): Promise<any> {
    console.error('An error occurred in Groupme Mock Service: ', error);
    return Promise.reject(error.message || error);
  }
}