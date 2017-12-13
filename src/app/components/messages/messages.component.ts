import { Component, OnInit } from "@angular/core";
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
export class MessagesComponent implements OnInit {
  constructor(private router: Router,
              private route: ActivatedRoute,
              private state: StateService,
              private faye: FayeService) {}

  currentGroupId: number;
  myUserId: number;
  messageSubject: Subject<Message[]> = new Subject();
  messages$: Observable<Message[]> = this.messageSubject.asObservable();
  messages: Message[] = [];

  ngOnInit() {
    this.myUserId = this.state.currentUserId;
    this.state.messages$.subscribe((messages) => {
      this.addMessagesFromArray(messages);
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.processGroupChange(params);
    });
    this.faye.message$.subscribe((notification) => {
      this.processNotification(notification);
    });
  }

  private addMessagesFromArray(messages: Message[]) {
    for (let message of messages) {
      this.addMessage(message);
    }
  }

  private processGroupChange(params: ParamMap) {
    this.messages = [];
    if (params.has('id')) {
      this.currentGroupId = MessagesComponent.getOriginalId(params.get('id'));
      if (MessagesComponent.isGroupMessageId(params.get('id'))) {
        this.state.updateGroupMessagesFromApi(this.currentGroupId);
      } else {
        this.state.updateChatMessagesFromApi(this.currentGroupId);
      }
    } else {
      this.state.updateMostRecentMessages();
    }
  }

  private processNotification(notification: FayeNotification) {
    if (notification.type == "line.create") {
      let message = notification.subject;
      let relevantGroup = this.state.getGroupById(message.group_id);
      if (relevantGroup.id == this.currentGroupId) {
        this.addMessage(message);
      } else {
        relevantGroup.hasNotification = true;
        MessagesComponent.showNotification(notification, relevantGroup);
      }
    }
  }

  private addMessage(message: Message) {
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
}