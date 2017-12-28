import { Injectable } from "@angular/core";
import { StoreService } from "./store.service";
import { GroupmeService } from "./groupme.service";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { Message } from "../models/message";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/fromPromise';
import { Member } from "../models/member";

@Injectable()
export class StateService {

  ACCESS_TOKEN_KEY: string = "access_token";

  currentAccessToken: string = "";
  currentChatId: string = "";
  currentUserId: number = 0;

  constructor(private groupme: GroupmeService, private store: StoreService) {
    this.currentAccessToken = this.store.get(this.ACCESS_TOKEN_KEY);
    this.currentUserId = this.store.getMe().user_id;
    this.currentChatId = this.store.getCurrentChatId();
  }

  groupsSubject: Subject<Group[]> = new Subject();
  groups$: Observable<Group[]> = this.groupsSubject.asObservable();

  updateGroupsFromApi(limit?: number, force = false) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    if (this.storeLastUpdate(Group.storeKey) && !force) {
      this.groupsSubject.next(this.store.getGroups(limit));
    } else {
      this.groupme.getGroups(this.currentAccessToken).then(response => {
        this.groupsSubject.next(response.slice(0, limit));
        this.store.putGroups(response);
        this.updateMembersList(response);
      });
    }
  }

  /**
   * Using a list of members obtained from a Group API call, store a list of unique users
   * @param {Group[]} groups
   */
  private updateMembersList(groups: Group[]) {
    let members: Member[] = this.store.getMembers();
    for (let i=0;i<groups.length;i++) {
      let group: Group = groups[i];
      for (let j=0;j<group.members.length;j++) {
        let groupMember: Member = group.members[j];
        let contains = false;
        for (let k=0;k<members.length;k++) {
          let member: Member = members[k];
          if (member.user_id == groupMember.user_id) {
            contains = true;
          }
        }
        if (!contains) {
          members.push(groupMember);
        }
      }
    }
    this.store.putMembersOverwrite(members);
  }

  getMemberFromStoreById(member_id: number): Member {
    return this.store.getMemberById(member_id);
  }

  getAllMembers(): Promise<Member[]> {
    return Promise.resolve(this.store.getMembers());
  }

  getGroupById(id: number, fromApi: boolean = false): Promise<Group> {
    if (fromApi) {
      return this.groupme.getGroup(this.currentAccessToken, id);
    } else {
      return Promise.resolve(this.store.getGroupById(id));
    }
  }

  getAllGroups(): Promise<Group[]> {
    return this.groupme.getGroups(this.currentAccessToken, 1, 20, true);
  }

  getFormerGroups(): Promise<Group[]> {
    return this.groupme.getFormerGroups(this.currentAccessToken);
  }

  updateGroup(groupId: number, property: any, value: any): void {
    this.getGroupById(groupId, false).then(group => {
      group[property] = value;
      this.store.updateGroup(group);
    });
  }

  destroyGroup(group_id: number): Promise<boolean> {
    return this.groupme.destroyGroup(this.currentAccessToken, group_id);
  }

  makeGroupOwner(group_id: number, user_id: number): Promise<boolean> {
    return this.groupme.changeOwner(this.currentAccessToken, group_id, user_id);
  }

  leaveGroup(group_id: number, my_membership_id: number): Promise<boolean> {
    return this.groupme.removeUserFromGroup(this.currentAccessToken, group_id, my_membership_id);
  }

  removeUserFromGroup(group_id: number, member_id: number): Promise<boolean> {
    return this.groupme.removeUserFromGroup(this.currentAccessToken, group_id, member_id);
  }

  updateGroupToAPI(group_id: number, new_name?: string, new_description?:string, new_image_url?: string, office_mode?: boolean, share?: boolean): Promise<boolean> {
    return this.groupme.updateGroup(this.currentAccessToken, group_id, new_name, new_description, new_image_url, office_mode, share);
  }

  chatsSubject: Subject<Chat[]> = new Subject();
  chats$: Observable<Chat[]> = this.chatsSubject.asObservable();

  updateChatsFromApi(limit?: number, force = false) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    if (this.storeLastUpdate(Chat.storeKey) && !force) {
      this.chatsSubject.next(this.store.getChats(limit));
    } else {
      this.groupme.getChats(this.currentAccessToken).then(response => {
        this.chatsSubject.next(response.slice(0, limit));
        this.store.putChats(response);
      });
    }
  }

  getAllChats(): Promise<Chat[]> {
    return this.groupme.getChats(this.currentAccessToken, 1, 20);
  }

  /*
    The messages channel is always the messages that are currently visible on screen.
   */
  messagesSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messagesSubject.asObservable();

  updateGroupMessagesFromApi(group_id: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    this.groupme.getGroupMessages(this.currentAccessToken, group_id).then(response => {
      this.messagesSubject.next(response);
      this.updateChatId('g'+group_id);
    });
  }

  updateGroupMessagesFromApiBeforeMessage(group_id: number, before_id: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    this.groupme.getGroupMessages(this.currentAccessToken, group_id, before_id).then(response => {
      this.messagesSubject.next(response);
      this.updateChatId('g'+group_id);
    });
  }

  updateChatMessagesFromApi(user_id: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    this.groupme.getDirectMessages(this.currentAccessToken, user_id).then(response => {
      this.messagesSubject.next(response);
      this.updateChatId('u'+user_id);
    });
  }

  updateMostRecentMessages() {
    if (this.currentChatId != "" && !this.accessTokenIsEmpty()) {
      if (StateService.currentChatIdIsGroup(this.currentChatId)) {
        this.updateGroupMessagesFromApi(StateService.getIdFromIdString(this.currentChatId));
      } else {
        this.updateChatMessagesFromApi(StateService.getIdFromIdString(this.currentChatId));
      }
    }
  }

  updateChatId(chat_id: string) {
    this.currentChatId = chat_id;
    this.store.putCurrentChatId(chat_id);
  }

  resetCurrentChatId() {
    this.store.putCurrentChatId('');
  }

  favoriteMessage(conversation_id: number, message_id: number): Promise<boolean> {
    return this.groupme.createLike(this.currentAccessToken, conversation_id, message_id);
  }

  unfavoriteMessage(conversation_id: number, message_id: number): Promise<boolean> {
    return this.groupme.destroyLike(this.currentAccessToken, conversation_id, message_id);
  }

  sendMessage(conversation_id: number, text: string): Promise<boolean> {
    let message_guid = ""+Date.now();
    return this.groupme.sendMessage(this.currentAccessToken, conversation_id, this.currentUserId, text, message_guid);
  }

  private static currentChatIdIsGroup(chat_id: string): boolean {
    return chat_id.indexOf('g') == 0;
  }

  private static getIdFromIdString(chat_id: string): number {
    return parseInt(chat_id.slice(1), 10);
  }

  private storeHas(key: string, defaultValue: any): boolean {
    return this.store.get(key) != defaultValue;
  }

  private storeLastUpdate(key: string): boolean {
    return this.storeHas(key+'_last_updated', 0);
  }

  accessTokenIsEmpty(): boolean {
    return this.store.get(this.ACCESS_TOKEN_KEY) == "";
  }

  validateUserKey(input_token: string): Promise<boolean> {
    return this.groupme.getMe(input_token).then((response) => {
      this.store.putMe(response);
      this.currentUserId = response.user_id;
      this.currentAccessToken = input_token;
      this.doFirstTimeSetup(input_token);
      return true;
    }).catch((response) => {
      console.error(response);
      return false;
    });
  }

  doFirstTimeSetup(validated_token: string) {
    this.store.putAccessToken(validated_token);
    this.updateGroupsFromApi(5);
    this.updateChatsFromApi(5);
  }

}