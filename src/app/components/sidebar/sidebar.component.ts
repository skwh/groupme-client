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
    this.updateInfo();
  }

  updateInfo() {
    this.state.getGroups(false, 5).then(response => this.groups = response);
    this.state.getChats(false, 5).then(response => this.contacts = response);
  }

}