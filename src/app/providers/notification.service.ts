import { Injectable } from "@angular/core";
import { FayeService } from "./faye.service";
import { StateService } from "./state.service";
import { FayeNotification } from "../models/notification";
import { Group } from "../models/group";
import { Chat } from "../models/chat";

@Injectable()
export class NotificationService {

  notificationSubscription;

  constructor(private faye: FayeService,
              private state: StateService) {
    this.notificationSubscription = this.faye.message$.subscribe((notification: FayeNotification) => {
      this.handleIncomingNotification(notification);
    })
  }

  private handleIncomingNotification(notification: FayeNotification) {
    console.log(notification);
    if (notification.type == "line.create") {
      if (this.messageComponentIsOpen() && this.notificationIsForCurrentGroup(notification)) {
        console.log("sending new message to current channel");
        let message = notification.subject;
        this.state.messagesSubject.next([message]);
      } else {
        console.log("Send a notification!");
        this.handleNotificationSend(notification);
      }
    }
  }

  private handleNotificationSend(notification: FayeNotification) {
    if (this.state.getNotificationSetting("on")) {
      if (this.channelIsForGroup()) {

      }
    }
  }

  private messageComponentIsOpen(): boolean {
    return this.state.currentChannelId != "";
  }

  private channelIsForGroup(): boolean {
    return this.state.currentChannelId.indexOf('g') == 0;
  }

  private notificationIsForCurrentGroup(notification: FayeNotification): boolean {
    return notification.subject.group_id == this.getIdNumber(this.state.currentChannelId);
  }

  private getIdNumber(id: string): number {
    return parseInt(id.slice(1));
  }

  private showNotification(notification: FayeNotification, channel_name: string, channel_image_url: string): Notification {
    return new Notification(channel_name, {
      'body': notification.alert,
      'icon': channel_image_url,
    });
  }

  private addGroupNotification(group: Group, notification: FayeNotification): void {
    this.state.updateGroup(group.id, "hasNotification", true);
    this.showNotification(notification, group.name, group.image_url);
    this.state.updateGroupsFromApi(5, false);
  }

  private addChatNotification(chat: Chat, notification: FayeNotification): void {
    this.state.updateChat(chat.other_user.id, "hasNotification", true);
    this.showNotification(notification, chat.other_user.nickname, chat.other_user.avatar_url);
    this.state.updateChatsFromApi(5, false);
  }

}