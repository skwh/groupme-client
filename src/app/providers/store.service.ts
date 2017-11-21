import { Injectable } from "@angular/core";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { isNull } from "util";

@Injectable()
export class StoreService {
  private localStore = window.localStorage;

  private store = {
    'user_key': "",
    'groups': [],
    'groups_last_updated': 0,
    'chats': [],
    'chats_last_updated': 0,
    'last_updated': 0,
    'myUserId': 0
  };

  get(key: string): any {
    return this.store[key];
  }

  put(key:string, value: any) {
    this.store.last_updated = Date.now();
    this.store[key] = value;
    this.putToLocalStore(key, value);
  }

  private putOnlyToStore(key: string, value: any) {
    this.store.last_updated = Date.now();
    this.store[key] = value;
  }

  updateFromLocalStore(key: string): boolean {
    let value = this.localStore.getItem(key);
    if (isNull(value)) {
      return false;
    } else {
      this.putOnlyToStore(key, value);
      return true;
    }
  }

  doLoad() {
    this.updateFromLocalStore('user_key');
    this.updateFromLocalStore('groups');
    this.updateFromLocalStore('groups_last_updated');
    this.updateFromLocalStore('chats');
    this.updateFromLocalStore('chats_last_updated');
    this.updateFromLocalStore('myUserId');
  }

  private putToLocalStore(key: string, value: any) {
    console.log("Putting "+ key + " to LocalStorage");
    this.localStore.setItem(key, value);
  }

  putUserKey(user_key: string) {
    if (user_key === "") {
      console.error("This key is empty!");
      throw new Error("This key is empty!");
    }
    this.put('user_key', user_key);
  }

  putGroups(groups: Group[]) {
    this.put('groups', JSON.stringify(groups));
    this.put('groups_last_updated', Date.now());
  }

  getGroups(limit: number): Group[] {
    let groups: Group[] = JSON.parse(this.get('groups'));
    if (limit <= 0) {
      return groups;
    } else {
      return groups.slice(0, limit);
    }
  }

  putChats(chats: Chat[]) {
    this.put('chats', JSON.stringify(chats));
    this.put('chats_last_updated', Date.now());
  }

  getChats(limit: number): Chat[] {
    let chats: Chat[] = JSON.parse(this.get('chats'));
    if (limit <= 0) {
      return chats;
    } else {
      return chats.slice(0, limit);
    }
  }

  putMyUserId(userId: number) {
    this.put('myUserId', ""+userId);
  }

  getMyUserId(): number {
    return this.get('myUserId');
  }

}