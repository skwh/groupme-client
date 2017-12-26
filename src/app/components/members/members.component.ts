import { Component, OnInit } from "@angular/core";
import { Chat } from "../../models/chat";
import { StateService } from "../../providers/state.service";
import { Member } from "../../models/member";

@Component({
  selector: 'app-members',
  templateUrl: 'members.component.html',
  styleUrls: ['members.component.scss']
})
export class MembersComponent implements OnInit {
  constructor(private state: StateService) {}

  chats: Chat[] = [];
  members: Member[] = [];

  myUserId: number;

  ngOnInit() {
    this.state.getAllChats().then(response => this.chats = response);
    this.state.getAllMembers().then(response => this.members = response);
    this.myUserId = this.state.currentUserId;
  }
}