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
    this.currentUserId = this.store.getMe().id;
    this.currentChatId = this.store.getCurrentChatId();
  }

  groupsSubject: Subject<Group[]> = new Subject();
  groups$: Observable<Group[]> = this.groupsSubject.asObservable();

  updateGroupsFromApi(limit?: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    if (this.storeLastUpdate(Group.storeKey)) {
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
          if (member.id === groupMember.id) {
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

  getGroupById(id: number): Group {
    return this.store.getGroupById(id);
  }

  chatsSubject: Subject<Chat[]> = new Subject();
  chats$: Observable<Chat[]> = this.chatsSubject.asObservable();

  updateChatsFromApi(limit?: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    if (this.storeLastUpdate(Chat.storeKey)) {
      this.chatsSubject.next(this.store.getChats(limit));
    } else {
      this.groupme.getChats(this.currentAccessToken).then(response => {
        this.chatsSubject.next(response.slice(0, limit));
        this.store.putChats(response);
      });
    }
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
      this.store.putCurrentChatId('g'+group_id);
    });
  }

  updateChatMessagesFromApi(user_id: number) {
    if (this.accessTokenIsEmpty()) {
      return;
    }
    this.groupme.getDirectMessages(this.currentAccessToken, user_id).then(response => {
      this.messagesSubject.next(response);
      this.store.putCurrentChatId('u'+user_id);
    });
  }

  updateMostRecentMessages() {
    if (this.currentChatId != "" && !this.accessTokenIsEmpty()) {
      if (this.currentChatIdIsGroup(this.currentChatId)) {
        this.updateGroupMessagesFromApi(this.getIdFromIdString(this.currentChatId));
      } else {
        this.updateChatMessagesFromApi(this.getIdFromIdString(this.currentChatId));
      }
    }
  }

  favoriteMessage(conversation_id: number, message_id: number): Promise<boolean> {
    return this.groupme.createLike(this.currentAccessToken, conversation_id, message_id);
  }

  unfavoriteMessage(conversation_id: number, message_id: number): Promise<boolean> {
    return this.groupme.destroyLike(this.currentAccessToken, conversation_id, message_id);
  }

  private currentChatIdIsGroup(chat_id: string): boolean {
    return chat_id.indexOf('g') == 0;
  }

  private getIdFromIdString(chat_id: string): number {
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
      this.currentUserId = response.id;
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