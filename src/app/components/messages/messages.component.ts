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
export class MessagesComponent implements OnInit{
  constructor(private router: Router,
              private route: ActivatedRoute,
              private state: StateService,
              private faye: FayeService) {}

  currentGroupId: number;
  myUserId: number;
  messageSubject: Subject<Message[]> = new Subject();
  messages: Observable<Message[]> = this.messageSubject.asObservable();

  ngOnInit() {
    this.myUserId = this.state.currentUserId;
    this.state.messages$.subscribe((messages) => this.messageSubject.next(messages));
    this.route.paramMap.subscribe((params: ParamMap) => {
      if (params.has('id')) {
        let originalId = this.getOriginalId(params.get('id'));
        this.currentGroupId = originalId;
        if (this.isGroupMessageId(params.get('id'))) {
          this.state.updateGroupMessagesFromApi(this.currentGroupId);
        } else {
          this.state.updateChatMessagesFromApi(this.currentGroupId);
        }
      } else {
        this.state.updateMostRecentMessages();
      }
    });
    this.faye.message$.subscribe((message) => {
      let relevantGroup = this.state.getGroupById(message.subject.group_id);
      if (relevantGroup.id == this.currentGroupId) {
        this.addMessage(message.subject);
      }
      this.showNotification(message, relevantGroup);
    });
  }

  private addMessage(message: Message) {
    this.messageSubject.next([message]);
    console.log(this.messageSubject);
  }

  private showNotification(notification: FayeNotification, relevantGroup: Group): Notification {
    return new Notification(relevantGroup.name, {
      'body': notification.alert,
      'icon': relevantGroup.image_url,
    });
  }

  private isGroupMessageId(id: string):boolean {
    if (id.indexOf("g") != -1) {
      return true;
    }
    return false;
  }

  private getOriginalId(id: string): number {
    return parseInt(id.slice(1),10);
  }
}