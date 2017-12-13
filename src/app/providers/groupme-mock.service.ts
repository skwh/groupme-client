import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { GroupmeService } from "./groupme.service";
import { HttpClient } from "@angular/common/http";
import { Chat } from "../models/chat";
import { Message } from "../models/message";
import { Member } from "../models/member";
import * as fs from "fs";

@Injectable()
export class GroupmeMockService extends GroupmeService {
  constructor(http: HttpClient) {
    super(http);
  }

  getGroups(token: string): Promise<Group[]> {
    return Promise.resolve(JSON.parse(fs.readFileSync('mocks/groups.mock.json', 'utf8')));
  }

  // TODO(skwh): finish getGroupMessages mock
  getGroupMessages(token: string, group_id: number): Promise<Message[]> {
    return null;
  }

  // TODO(skwh): finish getChats mock
  getChats(token: string): Promise<Chat[]> {
    return null;
  }

  // TODO(skwh): finish getDirectMessagesMock
  getDirectMessages(token: string, user_id: number, before_id?: number, since_id?: number): Promise<Message[]> {
    return null;
  }

  // TODO(skwh): finish getMe mock
  getMe(token: string): Promise<Member> {
    return null;
  }

  // TODO(skwh): finish createLike mock
  createLike(token: string, conversation_id: number, message_id: number): Promise<boolean> {
    return null;
  }

  // TODO(skwh): finish destroyLike mock
  destroyLike(token: string, conversation_id: number, message_id: number): Promise<boolean> {
    return null;
  }

  // TODO(skwh): finish handleError mock
  handleError(error: any): Promise<any> {
    return null;
  }
}