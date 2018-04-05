import { Injectable } from "@angular/core";
import { StateService } from "./state.service";
import { Message } from "../models/message";
import { Chat } from "../models/chat";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

@Injectable()
export class ChatsService {
  constructor (private state: StateService) {
    this.chatsMessages$ = this.chatsMessages$.merge(this.state.messages$);
  }

  currentChatId: number;

  chatsMessagesSubject: Subject<Message[]> = new Subject();
  chatsMessages$: Observable<Message[]> = this.chatsMessagesSubject.asObservable();

  mostRecentChats: Array<Chat>;

  sendMessage(message: Message): Promise<boolean> {
    return this.state.sendMessageToUser(this.currentChatId, message);
  }

  updateMessagesFromBeforeMessage(messageId: number): void {
    this.state.updateChatMessagesFromApiBeforeMessage(this.currentChatId, messageId);
  }

  loadLatestMessages(): void {
    this.state.updateChatMessagesFromApi(this.currentChatId);
  }
}