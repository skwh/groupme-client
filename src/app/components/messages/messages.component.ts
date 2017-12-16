import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { Observable } from "rxjs/Observable";
import { StateService } from "../../providers/state.service";
import { Message } from "../../models/message";
import { FayeService } from "../../providers/faye.service";
import { FayeNotification } from "../../models/notification";
import { Subject } from "rxjs/Subject";
import { Group } from "../../models/group";

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private state: StateService,
              private faye: FayeService) {}

  currentGroupId: number;
  myUserId: number;
  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  messages: Message[] = [];

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
    this.scrollToBottom();
  }

  private addMessagesFromArray(messages: Message[]): void  {
    for (let message of messages) {
      this.addMessage(message);
    }
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
      console.log(params);
      this.currentGroupId = 0;
      this.state.resetCurrentChatId();
      //this.state.updateMostRecentMessages();
    }
  }

  private addNotification(group: Group, notification: FayeNotification): void {
    this.state.updateGroup(group.id, "hasNotification", true);
    MessagesComponent.showNotification(notification, group);
    this.state.updateGroupsFromApi(5, false);
  }

  private removeNotification(groupId: number): void {
    let currentGroup = this.state.getGroupById(groupId);
    if (currentGroup && currentGroup.hasNotification) {
      this.state.updateGroup(groupId, "hasNotification", false);
      this.state.updateGroupsFromApi(5, false);
    }
  }

  private processNotification(notification: FayeNotification): void {
    if (notification.type == "line.create") {
      let message = notification.subject;
      let relevantGroup = this.state.getGroupById(message.group_id);
      if (message.group_id == this.currentGroupId) {
        this.addMessage(message);
      } else {
        this.addNotification(relevantGroup, notification);
      }
    }
  }

  private addMessage(message: Message): void {
    this.messages.push(message);
    this.messageSubject.next(this.messages);
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

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  ngOnDestroy() {
    this.notificationSubscription.unsubscribe();
    this.routeParamMapSubscription.unsubscribe();
    this.stateMessageSubscription.unsubscribe();
  }
}