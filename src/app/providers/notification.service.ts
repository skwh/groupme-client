import { Injectable } from "@angular/core";
import { FayeService } from "./faye.service";
import { StateService } from "./state.service";
import { FayeNotification } from "../models/notification";
import { Group } from "../models/group";
import { Chat } from "../models/chat";
import { isUndefined } from "util";
import { ChatsService } from "./chats.service";
import { GroupsService } from "./groups.service";

function copy(o) {
  let output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object") ? copy(v) : v;
  }
  return output;
}

@Injectable()
export class NotificationService {
  constructor(private faye: FayeService,
              private state: StateService,
              private group: GroupsService,
              private chat: ChatsService) {
  }

  notificationSubscription;
  storedNotifications: { [key: number]:Notification} = [];

  doSetup(): void {
    this.faye.connect();
    this.notificationSubscription = this.faye.message$.subscribe((notification: FayeNotification) => {
      this.handleIncomingNotification(notification);
    });
    this.storedNotifications = [];
  }

  private handleIncomingNotification(notification: FayeNotification) {
    console.log(notification);
    if (notification.type == "line.create" || notification.type == "direct_message.create") {
      if (this.messageComponentIsOpen() && this.notificationIsForCurrentGroup(notification)) {
        let message = notification.subject;
        this.state.messagesSubject.next([message]);
      } else {
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
    return (this.group.currentGroupId != 0 && this.chat.currentChatId != 0);
  }

  private notificationIsForCurrentGroup(notification: FayeNotification): boolean {
    return (notification.subject.group_id == this.group.currentGroupId
        || notification.subject.sender_id == this.chat.currentChatId);
  }

  private showNotification(notification_text: string, channel_name: string, channel_image_url: string, group_id: number): Notification {
    let not = new Notification(channel_name, {
      'body': notification_text,
      'icon': channel_image_url,
    });
    this.storedNotifications[group_id] = not;
    return not;
  }

  private addGroupNotification(group: Group, notification: FayeNotification): void {
    this.state.updateGroup(group.id, "hasNotification", true);
    let notificationBody = notification.alert;
    if (!isUndefined(this.storedNotifications[group.id])) {
     let existingNotification = copy(this.storedNotifications[group.id]);
     this.clearNotificationForId(group.id);
     notificationBody = notification.alert + "\n" + existingNotification.body;
    }
    this.showNotification(notificationBody, group.name, group.image_url, group.id);
    this.state.updateGroupsFromApi(5, false);
  }

  private addChatNotification(chat: Chat, notification: FayeNotification): void {
    this.state.updateChat(chat.other_user.id, "hasNotification", true);
    let notificationBody = notification.alert;
    if (!isUndefined(this.storedNotifications[chat.other_user.id])) {
      let existingNotification = copy(this.storedNotifications[chat.other_user.id]);
      this.clearNotificationForId(chat.other_user.id);
      notificationBody = notification.subject.text + "\n" + existingNotification.body;
    }
    this.showNotification(notificationBody, chat.other_user.name, chat.other_user.avatar_url, chat.other_user.id);
    this.state.updateChatsFromApi(5, false);
  }

  clearNotificationForId(id: number): void {
    if (!isUndefined(this.storedNotifications[id])) {
      this.storedNotifications[id].close();
      delete this.storedNotifications[id];
    }
  }

}