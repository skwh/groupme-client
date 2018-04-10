import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ChatsService } from "../../providers/chats.service";
import { Message } from "../../models/message";
import { Member } from "../../models/member";
import { StateService } from "../../providers/state.service";
import { Subscription } from "rxjs/Subscription";
import { NotificationService } from "../../providers/notification.service";

@Component({
  selector: 'app-chat-messages',
  templateUrl: 'chat-messages.component.html',
  styleUrls: ['chat-messages.component.scss']
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute,
              private chats: ChatsService,
              private state: StateService,
              private notification: NotificationService) {}

  currentUser: Member;
  currentChatId: number;
  messages: Array<Message> = [];
  requestPrevious: boolean = false;
  loadedAllMessages: boolean = false;

  messagesSubscription: Subscription;
  routeSubscription: Subscription;

  ngOnInit() {
    this.currentUser = this.state.currentUser;
    this.messagesSubscription = this.chats.chatsMessages$.subscribe((messages: Array<Message>) => {
      if (this.requestPrevious && messages.length === 0) {
        this.loadedAllMessages = true;
      } else {
        this.updateMessages(messages);
      }
      this.requestPrevious = false;
    });
    this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has('id')) {
        this.messages = [];
        this.currentChatId = Number(params.get('id'));
        this.chats.currentChatId = this.currentChatId;
        this.chats.loadLatestMessages();
        this.clearNotificationFlag(this.currentChatId);
      } else {
        console.error("No id provided to ChatMessagesComponent!");
      }
    });
  }

  clearNotificationFlag(id: number): void {
    this.state.updateChat(id, "hasNotification", false);
    this.notification.clearNotificationForId(id);
  }

  updateMessages(messages: Array<Message>): void {
    let newMessages = [...this.messages, ...messages];
    newMessages.sort((a: Message, b: Message) => {
      if (a.created_at < b.created_at) {
        return 1;
      } else if (a.created_at > b.created_at) {
        return -1;
      } else {
        return 0;
      }
    });
    this.messages = newMessages;
  }

  sendMessage(message: Message): void {
    //TODO(skwh): Push sent message to messages-list then wait for response as to success, mark as such.
    this.chats.sendMessage(message).then(result => {
      if (result) {
        this.chats.chatsMessagesSubject.next([message]);
      }
    })
  }

  getPreviousMessages(messageId: number): void {
    this.requestPrevious = true;
    this.chats.updateMessagesFromBeforeMessage(messageId);
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }
}