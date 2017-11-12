import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import 'rxjs/add/operator/switchMap';
import { Observable } from "rxjs/Observable";
import { StateService } from "../../providers/state.service";
import { Message } from "../../models/message";

@Component({
  selector: 'app-messages-list',
  templateUrl: 'messages.component.html',
  styleUrls: ['messages.component.scss']
})
export class MessagesComponent implements OnInit{
  constructor(private router: Router, private route: ActivatedRoute, private state: StateService) {}

  currentId: number;
  messages: Observable<Message[]>;

  ngOnInit() {
    this.messages = this.route.paramMap.switchMap((params: ParamMap) => {
      if (params.has('id')) {
        let originalId = this.getOriginalId(params.get('id'));
        if (this.isGroupMessageId(params.get('id'))) {
          return this.state.getGroupMessages(originalId);
        } else {
          return this.state.getDirectMessages(originalId);
        }
      } else {
        return this.state.getMostRecentGroupMessages();
      }
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