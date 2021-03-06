import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { isNull } from "util";
import { Member } from "../models/member";

export interface NotificationSettings {
  on: boolean;
  forChats: boolean;
  forGroups: boolean;
  forAvatar: boolean;
  forTopic: boolean;
  frequency: number;
}

export interface ColorSettings {
  nightMode: boolean;
}

export interface WindowSettings {
  keepRunning: boolean;
}

export interface Settings {
  notifications: NotificationSettings;
  color: ColorSettings;
  window: WindowSettings;
}

interface Store {
  access_token: string;
  groups: Group[];
  groups_last_updated: number;
  chats: Chat[];
  chats_last_updated: number;
  last_updated: number;
  me: Member;
  current_channel_id: string;
  members: Member[];
  settings: Settings;
}

@Injectable()
export class StoreService {
  private localStore = window.localStorage;

  ACCESS_TOKEN_KEY = "access_token";

  private store: Store = {
    access_token: "",
    groups: [],
    groups_last_updated: 0,
    chats: [],
    chats_last_updated: 0,
    last_updated: 0,
    me: <Member> {},
    current_channel_id: '',
    members: [],
    settings: <Settings> {},
  };

  clear(): void {
    this.localStore.clear();
  }

  get(key: string): any {
    return this.store[key];
  }

  put(key:string, value: any) {
    this.store.last_updated = Date.now();
    this.store[key] = value;
    this.putToLocalStore(key, JSON.stringify(value));
  }

  private putOnlyToStore(key: string, value: any) {
    this.store.last_updated = Date.now();
    this.store[key] = value;
  }

  updateFromLocalStore(key: string): boolean {
    let value = JSON.parse(this.localStore.getItem(key));
    if (isNull(value)) {
      return false;
    } else {
      this.putOnlyToStore(key, value);
      return true;
    }
  }

  doLoad() {
    for (let property in this.store) {
      if (this.store.hasOwnProperty(property)) {
        this.updateFromLocalStore(property);
      }
    }
  }

  private putToLocalStore(key: string, value: any) {
    console.log("Putting "+ key + " to LocalStorage");
    this.localStore.setItem(key, value);
  }

  putAccessToken(user_token: string) {
    if (user_token === "") {
      console.error("This token is empty!");
      throw new Error("This token is empty!");
    }
    this.put(this.ACCESS_TOKEN_KEY, user_token);
  }

  putGroups(groups: Group[]) {
    this.put(Group.storeKey, groups);
    this.put(Group.storeKey + '_last_updated', Date.now());
  }

  putGroup(group: Group): void {
    let groups: Group[] = this.get(Group.storeKey);
    groups.push(group);
    this.putGroups(groups);
  }

  updateGroup(group: Group) {
    let groups: Group[] = this.get(Group.storeKey);
    for (let g of groups) {
      if (g.id == group.id) {
        g = group;
        this.putGroups(groups);
        return;
      }
    }
    // if the group was not already in the list, do nothing.
  }

  getGroups(limit: number): Group[] {
    let groups: Group[] = this.get(Group.storeKey);
    if (limit <= 0) {
      return groups;
    } else {
      return groups.slice(0, limit);
    }
  }

  getGroupById(id: number): Group {
    let groups: Group[] = this.getGroups(0);
    for (let g of groups) {
      // even though we've listed the id as a number, it gets read from json as a string
      if (g.id == id) {
        return g;
      }
    }
    return null;
  }

  putChats(chats: Chat[]) {
    this.put(Chat.storeKey, chats);
    this.put(Chat.storeKey + '_last_updated', Date.now());
  }

  getChats(limit: number): Chat[] {
    let chats: Chat[] = this.get(Chat.storeKey);
    if (limit <= 0) {
      return chats;
    } else {
      return chats.slice(0, limit);
    }
  }

  getChatByUserId(user_id: number): Chat {
    let chats: Chat[] = this.get(Chat.storeKey);
    for (let i=0;i<chats.length;i++) {
      if (chats[i].other_user.id == user_id) {
        return chats[i];
      }
    }
    return null;
  }

  updateChatByUserId(user_id: number, new_chat: Chat): void {
    let chats: Chat[] = this.get(Chat.storeKey);
    for (let i=0;i<chats.length;i++) {
      if (chats[i].other_user.id == user_id) {
        chats[i] = new_chat;
      }
    }
    this.putChats(chats);
  }

  putMe(me: Member) {
    this.put(Member.userStoreKey, me);
  }

  getMe(): Member {
    return this.get(Member.userStoreKey);
  }

  putCurrentChannelId(channel_id: string) {
    this.put('current_channel_id', channel_id);
  }

  getCurrentChannelId(): string {
    return this.get('current_channel_id');
  }

  putMember(member: Member) {
    let previousMembers: Member[] = this.getMembers();
    previousMembers.push(member);
    this.put(Member.storeKey, previousMembers);
  }

  putMembersOverwrite(members: Member[]) {
    this.put(Member.storeKey, members);
  }

  getMembers(): Member[] {
    return this.get(Member.storeKey);
  }

  getMemberById(id: number): Member {
    let members: Member[] = this.getMembers();
    for (let i=0;i<members.length;i++) {
      if (members[i].user_id == id) {
        return members[i];
      }
    }
    return null;
  }

  getSetting(key: string): any {
    return this.get("settings")[key];
  }

  setSetting(key: string, value: any): void {
    let settings = this.get('settings');
    settings[key] = value;
    this.put("settings", settings);
  }

  setSettings(settingsObject: object): void {
    this.put("settings", settingsObject);
  }

  getNotificationSetting(key: string): any {
    return this.getSetting("notifications")[key];
  }

  setNotificationSetting(key: string, value: any): void {
    let notifications = this.getSetting("notifications");
    notifications[key] = value;
    this.setSetting("notifications", notifications);
  }

}