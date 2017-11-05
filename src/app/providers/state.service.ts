import { Injectable } from "@angular/core";
import { StoreService } from "./store.service";
import { GroupmeService } from "./groupme.service";
import { Group } from "../models/group";
import { Chat } from "../models/chat";

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
    return val == defaultValue;
  }

  /**
   * Wraps around StateService.checkInStore, used for *_last_updated keys.
   * @param {string} key
   * @returns {boolean}
   */
  private checkLastUpdated(key: string): boolean {
    return this.checkInStore(key, 0);
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


  getGroups(forceUpdate: boolean): Promise<Group[]> {
   if (this.userKeyIsEmpty()) {
     return Promise.resolve([]);
   } else {
     if (!this.checkLastUpdated('groups') || forceUpdate) {
       return this.groupme.getGroups(this.getUserKey());
     } else {
       return Promise.resolve(this.store.get('groups'));
     }
   }
  }

  getChats(forceUpdate: boolean): Promise<Chat[]> {
    if (this.userKeyIsEmpty()) {
      return Promise.resolve([]);
    } else {
      if (!this.checkLastUpdated('chats') || forceUpdate) {
        return this.groupme.getChats(this.getUserKey());
      }
      return Promise.resolve(this.store.getChats());
    }
  }

  putUserKey(key: string) {
    this.store.putUserKey(key);
  }

  doFirstTimeSetup(key: string) {
    this.putUserKey(key);
    let newGroups: Group[];
    let newChats: Chat[];
    this.getGroups(true).then(response => {
      newGroups = response;
      this.store.putGroups(newGroups);
    });
    this.getChats(true).then(response => {
      newChats = response;
      this.store.putChats(newChats);
    });
  }



}