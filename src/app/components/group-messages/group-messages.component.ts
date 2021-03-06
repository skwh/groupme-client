import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { GroupsService } from "../../providers/groups.service";
import { Message } from "../../models/message";
import { StateService } from "../../providers/state.service";
import { Member } from "../../models/member";
import { Subscription } from "rxjs/Subscription";
import { NotificationService } from "../../providers/notification.service";

@Component({
  selector: 'app-group-messages',
  templateUrl: 'group-messages.component.html',
  styleUrls: ['group-messages.component.scss']
})
export class GroupMessagesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute,
              private groups: GroupsService,
              private state: StateService,
              private notification: NotificationService) {}

  currentUser: Member;
  groupId: number;
  messages: Array<Message> = [];
  requestPrevious: boolean = false;
  loadedAllMessages: boolean = false;

  messagesSubscription: Subscription;
  routeSubscription: Subscription;

  ngOnInit() {
    this.currentUser = this.state.currentUser;
    this.messagesSubscription = this.groups.groupMessages$.subscribe((messages: Array<Message>) => {
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
        this.groupId = Number(params.get('id'));
        this.groups.currentGroupId = this.groupId;
        this.groups.loadLatestMessages();
        this.clearNotificationFlag(this.groupId);
      } else {
        console.error("No id provided to GroupMessagesComponent!");
      }
    });
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

  clearNotificationFlag(id: number): void {
    this.state.updateGroup(id, "hasNotification", false);
    this.notification.clearNotificationForId(id);
  }

  sendMessage(message: Message): void {
    //TODO(skwh): Push sent message to messages-list then wait for response as to success, mark as such.
    this.groups.sendMessage(message).then(result => {
      if (result) {
        // this.groups.groupMessagesSubject.next([message]);
      }
    })
  }

  getPreviousMessages(messageId: number): void {
    this.requestPrevious = true;
    this.groups.updateMessagesFromBeforeMessage(messageId);
  }

  ngOnDestroy() {
    this.groups.currentGroupId = 0;
    this.messagesSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

}