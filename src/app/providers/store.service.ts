import { Injectable } from "@angular/core";
import { Group } from "../models/group";

@Injectable()
export class StoreService {
  private localStore = window.localStorage;
  private state = {
    last_updated: 0,
    groups: [],
    user_key: ""
  };

  setUserKey(key: string) {
    if (key === '') {
      console.log("This key is empty!");
      return;
    }
    console.log("Setting user key to " + key);
    this.state.user_key = key;
    this.commitToLocalStore('user_key', this.state.user_key);
  }

  getUserKey(): string {
    return this.state.user_key;
  }

  updateGroups(groups: Group[]) {
    console.log("Updating groups!");
    this.state.groups = groups;
    this.state.last_updated = Date.now();
    this.commitStateToLocalStore();
  }

  getGroups(): Group[] {
    return this.state.groups;
  }

  getLastUpdated(): number {
    return this.state.last_updated;
  }

  commitStateToLocalStore() {
    this.localStore.setItem('last_updated', this.state.last_updated.toString());
    this.localStore.setItem('user_key', this.state.user_key);
    this.localStore.setItem('groups', this.state.groups.toString());
  }

  private commitToLocalStore(key:string, item: any) {
    this.localStore.setItem(key, item.toString());
  }

  private clearFromLocalStore(key: string) {
    this.localStore.setItem(key, '');
  }

  retrieveAllFromLocalStore() {
    console.log("Overwriting current store with values from localStorage!");
    this.state.last_updated = parseInt(this.localStore.getItem('last_updated'), 10);
    this.state.user_key = this.localStore.getItem('user_key');
    console.log(this.localStore.getItem('groups'));
  }

}