import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { StateService } from "../../providers/state.service";
import { Message } from "../../models/message";
import { FayeService } from "../../providers/faye.service";
import { FayeNotification } from "../../models/notification";
import { Group } from "../../models/group";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/switchMap';
import { Chat } from "../../models/chat";

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute,
              private state: StateService,
              private faye: FayeService) {}

  currentGroupId: number;
  currentGroup: Group;
  currentChat: Chat;
  myUserId: number;
  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  messages: Message[] = [];
  reverseMessages: boolean = false;
  oldScrollHeight: number = 0;

  stateMessageSubscription;
  routeParamMapSubscription;
  notificationSubscription;

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  ngOnInit() {
    this.myUserId = this.state.currentUserId;
    this.stateMessageSubscription = this.state.messages$.subscribe((messages) => {
      this.addMessagesFromArray(messages);
    });
    this.routeParamMapSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      this.processGroupChange(params);
    });
    this.notificationSubscription = this.faye.message$.subscribe((notification) => {
      this.processNotification(notification);
    });
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    if (this.oldScrollHeight != this.getScrollHeight()) {
      if (this.reverseMessages) {
        this.scrollToOldPosition();
        this.reverseMessages = false;
      } else {
        this.scrollToBottom();
      }
      this.oldScrollHeight = this.getScrollHeight();
    }
  }

  sendMessageToGroup(text: string): void {
    this.state.sendMessage(this.currentGroupId, text).then(result => {
      console.log(result);
    });
  }

  private addMessagesFromArray(messages: Message[]): void  {
    for (let message of messages) {
      this.addMessage(message);
    }
    this.oldScrollHeight = this.getScrollHeight();
  }

  private processGroupChange(params: ParamMap): void {
    this.messages = [];
    if (params.has('id')) {
      this.currentGroupId = MessagesComponent.getOriginalId(params.get('id'));
      if (MessagesComponent.isGroupMessageId(params.get('id'))) {
        this.removeNotification(this.currentGroupId);
        this.state.updateGroupMessagesFromApi(this.currentGroupId);
      } else {
        this.state.updateChatMessagesFromApi(this.currentGroupId);
      }
    } else {
      this.currentGroupId = 0;
      this.state.resetCurrentChatId();
    }
  }

  private addNotification(group: Group, notification: FayeNotification): void {
    this.state.updateGroup(group.id, "hasNotification", true);
    MessagesComponent.showNotification(notification, group);
    this.state.updateGroupsFromApi(5, false);
  }

  private removeNotification(groupId: number): void {
    if (this.currentGroup && this.currentGroup.hasNotification) {
      this.state.updateGroup(groupId, "hasNotification", false);
      this.state.updateGroupsFromApi(5, false);
    }
  }

  private processNotification(notification: FayeNotification): void {
    if (notification.type == "line.create") {
      let message = notification.subject;
      this.state.getGroupById(message.group_id).then(relevantGroup => {
        if (message.group_id == this.currentGroupId) {
          this.addMessage(message);
        } else if (!relevantGroup.muted) {
          this.addNotification(relevantGroup, notification);
        }
      });
    }
  }

  private addMessage(message: Message): void {
    if (this.reverseMessages) {
      this.messages.unshift(message);
      this.messageSubject.next(this.messages);
    } else {
      this.messages.push(message);
      this.messageSubject.next(this.messages);
    }
  }

  private scrollToOldPosition(): void {
    /*
        When the new content is loaded, we want to measure its height and scroll down by that much.
        scrollHeight = total scrollable height of the element
        scrollTop = current scrolled amount
       */
    let newScrollHeight = this.getScrollHeight();
    let oldPosition = newScrollHeight - this.oldScrollHeight;
    this.scrollToLocation(oldPosition);
  }


  private static showNotification(notification: FayeNotification, relevantGroup: Group): Notification {
    return new Notification(relevantGroup.name, {
      'body': notification.alert,
      'icon': relevantGroup.image_url,
    });
  }

  private static isGroupMessageId(id: string): boolean {
    return id.indexOf("g") != -1;

  }

  private static getOriginalId(id: string): number {
    return parseInt(id.slice(1),10);
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  private scrollToLocation(location: number): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = location;
    } catch (error) { }
  }

  private getScrollHeight(): number {
    return this.messagesContainer.nativeElement.scrollHeight;
  }

  onScroll(ev: Event) {
    if (ev.srcElement.scrollTop === 0) {
      console.log("At the top!");
      this.getPreviousMessages();
    }
  }

  private getPreviousMessages(): void {
    let firstMessageId = this.messages[0].id;
    this.reverseMessages = true;
    this.state.updateGroupMessagesFromApiBeforeMessage(this.currentGroupId, firstMessageId);
  }

  ngOnDestroy() {
    this.notificationSubscription.unsubscribe();
    this.routeParamMapSubscription.unsubscribe();
    this.stateMessageSubscription.unsubscribe();
  }
}