import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { ChatsService } from "../../providers/chats.service";
import { Message } from "../../models/message";
import { Member } from "../../models/member";
import { StateService } from "../../providers/state.service";
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'app-chat-messages',
  templateUrl: 'chat-messages.component.html',
  styleUrls: ['chat-messages.component.scss']
})
export class ChatMessagesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private chats: ChatsService, private state: StateService) {}

  currentUser: Member;
  currentChatId: number;
  messages: Array<Message> = [];

  messagesSubscription: Subscription;
  routeSubscription: Subscription;

  ngOnInit() {
    this.currentUser = this.state.currentUser;
    this.messagesSubscription = this.chats.chatsMessages$.subscribe((messages: Array<Message>) => {
      console.log(messages);
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
    });
    this.routeSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has('id')) {
        this.messages = [];
        this.currentChatId = Number(params.get('id'));
        this.chats.currentChatId = this.currentChatId;
        this.chats.loadLatestMessages();
      } else {
        console.error("No id provided to ChatMessagesComponent!");
      }
    });
  }

  sendMessage(message: Message): void {
    //TODO(skwh): Push sent message to messages-list then wait for response as to success, mark as such.
    this.chats.sendMessage(message).then(result => {
      console.log(result);
    })
  }

  getPreviousMessages(messageId: number): void {
    this.chats.updateMessagesFromBeforeMessage(messageId);
  }

  ngOnDestroy() {
    this.messagesSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }
}