import { Injectable } from "@angular/core";
import FayeClient from "../../assets/client";
import { StateService } from "./state.service";

@Injectable()
export class FayeService {
  client: FayeClient;
  token: string;

  constructor(private state: StateService) {
    this.client = new Faye.Client("http://push.groupme.com/faye");
    this.token = this.state.getUserKey();
    this.client.setHeader('Access Token', this.token);
    this.client.setHeader('Timestamp', Date.now());
    this.state.getMyUserId().then(user_id => {
      let subscription = this.client.subscribe('/user/'+user_id, function(message) {
        console.log(message);
      });
      console.log(subscription);
      console.log(this.client);
    })
  }
}