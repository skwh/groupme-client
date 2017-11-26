import { Injectable } from "@angular/core";
import FayeClient from "../../assets/client";
import { StateService } from "./state.service";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { FayeNotification } from "../models/notification";

@Injectable()
export class FayeService {
  client: FayeClient;
  token: string;

  messageSubject:Subject<FayeNotification> = new Subject();
  message$: Observable<FayeNotification> = this.messageSubject.asObservable();

  constructor(private state: StateService) {
    this.client = new Faye.Client("http://push.groupme.com/faye");
    this.token = this.state.currentAccessToken;
    this.client.addExtension({
      outgoing: (message, callback) => {
        if (message.channel !== '/meta/subscribe') {
          return callback(message);
        }

        message.ext = message.ext || {};
        message.ext["access_token"] = this.token;
        message.ext.timestamp = Date.now();
        callback(message);
      }
    });
    let user_id = this.state.currentUserId;
    let subscription = this.client.subscribe('/user/'+user_id, (message) => {
      this.messageSubject.next(message);
    });
  }
}