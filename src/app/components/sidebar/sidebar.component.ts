import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { Chat } from "../../models/chat";
import { Group } from "../../models/group";

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private state: StateService) {}

  groups: Group[];
  contacts: Chat[];

  ngOnInit() {
    this.state.chats$.subscribe((chats) => this.contacts = chats);
    this.state.groups$.subscribe((groups) => this.groups = groups);
    this.state.updateChatsFromApi(5);
    this.state.updateGroupsFromApi(5);
  }

}