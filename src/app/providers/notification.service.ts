import { Injectable } from "@angular/core";
import { FayeService } from "./faye.service";
import { StateService } from "./state.service";
import { FayeNotification } from "../models/notification";
import { Group } from "../models/group";
import { Chat } from "../models/chat";

@Injectable()
export class NotificationService {
  constructor(private faye: FayeService,
              private state: StateService) {
    this.notificationSubscription = this.faye.message$.subscribe((notification: FayeNotification) => {
      this.handleIncomingNotification(notification);
    });
    this.storedNotifications = [];
  }

  notificationSubscription;
  storedNotifications: Notification[];

  private handleIncomingNotification(notification: FayeNotification) {
    console.log(notification);
    if (notification.type == "line.create" || notification.type == "direct_message.create") {
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
      if (notification.type == "line.create") {
        let idNumber = parseInt(""+notification.subject.group_id, 10);
        this.state.getGroupById(idNumber).then(group => {
          this.addGroupNotification(group, notification);
        });
      } else {
        let idNumber = parseInt(notification.subject.chat_id.slice(notification.subject.chat_id.indexOf("+")), 10);
        let chat = this.state.getChatByUserId(idNumber);
        this.addChatNotification(chat, notification);
      }
    }
  }

  private messageComponentIsOpen(): boolean {
    return this.state.currentChannelId != "";
  }

  private notificationIsForCurrentGroup(notification: FayeNotification): boolean {
    return (notification.subject.group_id == this.getIdNumber(this.state.currentChannelId)
        || notification.subject.sender_id == this.getIdNumber(this.state.currentChannelId)
        || (notification.subject.chat_id &&
            notification.subject.chat_id.indexOf(""+this.getIdNumber(this.state.currentChannelId)) != -1));
  }

  private getIdNumber(id: string): number {
    return parseInt(id.slice(1));
  }

  private showNotification(notification_text: string, channel_name: string, channel_image_url: string): Notification {
    let not = new Notification(channel_name, {
      'body': notification_text,
      'icon': channel_image_url,
    });
    this.storedNotifications.push(not);
    return not;
  }

  private addGroupNotification(group: Group, notification: FayeNotification): void {
    this.state.updateGroup(group.id, "hasNotification", true);
    this.showNotification(notification.alert, group.name, group.image_url);
    this.state.updateGroupsFromApi(5, false);
  }

  private addChatNotification(chat: Chat, notification: FayeNotification): void {
    this.state.updateChat(chat.other_user.id, "hasNotification", true);
    this.showNotification(notification.subject.text, chat.other_user.name, chat.other_user.avatar_url);
    this.state.updateChatsFromApi(5, false);
  }

}