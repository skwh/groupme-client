import { Injectable } from "@angular/core";
import { StoreService } from "./store.service";
import { GroupmeService } from "./groupme.service";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { Message } from "../models/message";

@Injectable()
export class StateService {
  constructor(private groupme: GroupmeService, private store: StoreService) {}

  USER_KEY = 'user_key';

  /**
   * Checks if a value exists in the store. If the value of the item in the store equals defaultValue,
   * this returns false, otherwise true.
   * @param {string} key
   * @param defaultValue
   * @returns {boolean}
   */
  private checkInStore(key: string, defaultValue: any): boolean {
    let val = this.store.get(key);
    if (val == defaultValue) {
      return false;
    }
    return true;
  }

  /**
   * Wraps around StateService.checkInStore, used for *_last_updated keys.
   * @param {string} key
   * @returns {boolean}
   */
  private checkLastUpdated(key: string): boolean {
    return this.checkInStore(key + "_last_updated", '0');
  }

  /**
   * Return the user_key held in storage.
   * @returns {string}
   */
  getUserKey(): string {
    return this.store.get(this.USER_KEY);
  }

  /**
   * If a user key has not been entered into the store, return true. Else return false.
   * @returns {boolean}
   */
  userKeyIsEmpty(): boolean {
    return this.getUserKey() == "";
  }


  getGroups(forceUpdate: boolean, limit: number): Promise<Group[]> {
   if (this.userKeyIsEmpty()) {
     return Promise.resolve([]);
   } else {
     if (!this.checkLastUpdated('groups') || forceUpdate) {
       let newGroups: Group[] = [];
       return this.groupme.getGroups(this.getUserKey()).then(response => {
         newGroups = response;
         this.store.putGroups(newGroups);
         return Promise.resolve(this.store.getGroups(limit));
       });
     }
     return Promise.resolve(this.store.getGroups(limit));
   }
  }

  getChats(forceUpdate: boolean, limit: number): Promise<Chat[]> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve([]);
    } else {
      if (!this.checkLastUpdated('chats') || forceUpdate) {
        let newChats: Chat[] = [];
        return this.groupme.getChats(this.getUserKey()).then(response => {
          newChats = response;
          this.store.putChats(newChats);
          return Promise.resolve(this.store.getChats(limit));
        });
      }
      return Promise.resolve(this.store.getChats(limit));
    }
  }

  getDirectMessages(user_id: number, before_id?: number, since_id?: number): Promise<Message[]> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve([]);
    } else {
      return this.groupme.getDirectMessages(this.getUserKey(), user_id, before_id, since_id);
    }
  }

  getGroupMessages(group_id: number): Promise<Message[]> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve([]);
    } else {
      return this.groupme.getGroupMessages(this.getUserKey(), group_id);
    }
  }

  getMostRecentGroupMessages(): Promise<Message[]> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve([]);
    } else {
      let groupId = this.store.getGroups(1)[0].id;
      return this.getGroupMessages(groupId);
    }
  }

  getMostRecentGroupId(): number {
    if (this.userKeyIsEmpty()) {
      return 0;
    } else {
      return this.store.getGroups(1)[0].id;
    }
  }

  getMyUserId(): Promise<number> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve(0);
    } else {
      if (!this.checkInStore('myUserId', 0)) {
        return this.groupme.getMe(this.getUserKey()).then(response => {
          this.store.putMyUserId(response.id);
          return Promise.resolve(this.store.getMyUserId());
        });
      }
      return Promise.resolve(this.store.getMyUserId());
    }
  }

  validateUserKey(key: string): Promise<boolean> {
    return this.groupme.getMe(key).then(() => {
      return true;
    }).catch(() => {return false;});
  }

  putUserKey(key: string) {
    this.store.putUserKey(key);
  }

  doFirstTimeSetup(key: string) {
    console.log("Performing first time setup");
    this.putUserKey(key);
    this.getMyUserId().then(() => {
      this.getGroups(true, 0);
      this.getChats(true, 0);
    });
  }

}