import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { StateService } from "../../providers/state.service";
import { Message } from "../../models/message";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute,
              private state: StateService) {}

  currentChannelId: string;
  currentChannelNumber: number;
  currentChannelIsGroup: boolean = null;
  myUserId: number;
  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  messages: Message[] = [];
  reverseMessages: boolean = false;
  oldScrollHeight: number = 0;

  stateMessageSubscription;
  routeParamMapSubscription;

  @ViewChild('messagesContainer') private messagesContainer: ElementRef;

  ngOnInit() {
    this.myUserId = this.state.currentUserId;
    this.stateMessageSubscription = this.state.messages$.subscribe((messages) => {
      this.addMessagesFromArray(messages);
    });
    this.routeParamMapSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      this.processChannelChange(params);
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

  sendMessageToChannel(message: Message): void {
    if (this.currentChannelIsGroup) {
      this.sendMessageToGroup(message);
    } else {
      this.sendMessageToChat(message);
    }
  }

  private sendMessageToGroup(message: Message): void {
    this.state.sendMessageToGroup(this.currentChannelNumber, message).then(result => {
      console.log(result);
      this.state.updateGroupMessagesFromApi(this.currentChannelNumber);
    });
  }

  private sendMessageToChat(message: Message): void {
    this.state.sendMessageToUser(this.currentChannelNumber, message).then(result => {
      console.log(result);
      this.state.updateChatMessagesFromApi(this.currentChannelNumber);
    })
  }

  private addMessagesFromArray(messages: Message[]): void  {
    for (let message of messages) {
      this.addMessage(message);
    }
    this.oldScrollHeight = this.getScrollHeight();
  }

  private processChannelChange(params: ParamMap): void {
    this.messages = [];
    if (params.has('id')) {
      this.currentChannelId = params.get('id');
      this.currentChannelNumber = MessagesComponent.getOriginalId(this.currentChannelId);
      try {
        this.state.removeNotificationFromChannel(this.currentChannelId);
      } catch (err) {
        console.log("Tried to remove a notification from a chat that doesn't exist");
      }
      if (MessagesComponent.isGroupMessageId(this.currentChannelId)) {
        this.currentChannelIsGroup = true;
        this.state.updateGroupMessagesFromApi(this.currentChannelNumber);
      } else {
        this.currentChannelIsGroup = false;
        this.state.updateChatMessagesFromApi(this.currentChannelNumber);
      }
    } else {
      this.resetChannelIndicators();
    }
  }

  private resetChannelIndicators(): void {
    this.currentChannelNumber = 0;
    this.currentChannelId = "";
    this.currentChannelIsGroup = null;
    this.state.resetCurrentChannelId();
  }

  private updateMessages(): void {
    if (this.currentChannelIsGroup) {
      this.state.updateGroupMessagesFromApi(this.currentChannelNumber);
    } else {
      this.state.updateChatMessagesFromApi(this.currentChannelNumber);
    }
  }

  // private addNotification(group: Group, notification: FayeNotification): void {
  //   this.state.updateGroup(group.id, "hasNotification", true);
  //   MessagesComponent.showNotification(notification, group);
  //   this.state.updateGroupsFromApi(5, false);
  // }

  // private processNotification(notification: FayeNotification): void {
  //   if (notification.type == "line.create") {
  //     let message = notification.subject;
  //     this.state.getGroupById(message.group_id).then(relevantGroup => {
  //       if (message.group_id == this.currentGroupId) {
  //         this.addMessage(message);
  //       } else if (!relevantGroup.muted) {
  //         this.addNotification(relevantGroup, notification);
  //       }
  //     });
  //   }
  // }

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


  // private static showNotification(notification: FayeNotification, relevantGroup: Group): Notification {
  //   return new Notification(relevantGroup.name, {
  //     'body': notification.alert,
  //     'icon': relevantGroup.image_url,
  //   });
  // }

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
    if (this.currentChannelIsGroup) {
      this.state.updateGroupMessagesFromApiBeforeMessage(this.currentChannelNumber, firstMessageId);
    } else {
      this.state.updateChatMessagesFromApiBeforeMessage(this.currentChannelNumber, firstMessageId);
    }
  }

  ngOnDestroy() {
    this.state.resetCurrentChannelId();
    this.routeParamMapSubscription.unsubscribe();
    this.stateMessageSubscription.unsubscribe();
  }
}