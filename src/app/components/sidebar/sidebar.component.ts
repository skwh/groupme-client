import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { Chat } from "../../models/chat";
import { Group } from "../../models/group";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { ElectronService } from "../../providers/electron.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private state: StateService,
              private electronService: ElectronService) {}

  groups: Group[] = [];
  groupSubject: Subject<Group[]> = new Subject();
  groups$: Observable<Group[]> = this.groupSubject.asObservable();

  contacts: Chat[] = [];
  contactsSubject: Subject<Chat[]> = new Subject();
  contacts$: Observable<Chat[]> = this.contactsSubject.asObservable();

  ngOnInit() {
    this.state.chats$.subscribe((chats) => {this.addChatFromArray(chats)});
    this.state.groups$.subscribe((groups) => {this.addGroupFromArray(groups)});
    this.state.updateChatsFromApi(5, true);
    this.state.updateGroupsFromApi(5, true);
  }

  private addGroupFromArray(groups: Group[]) {
    this.groups = [];
    let groupNames = [];
    let groupIds = [];
    for (let i=0;i<groups.length;i++) {
      this.addGroup(groups[i]);
      groupNames.push(groups[i].name);
      groupIds.push(groups[i].id);
    }
    this.electronService.ipcRenderer.send('group-menu-update', [groupNames, groupIds]);
  }

  private addGroup(group: Group) {
    this.groups.push(group);
    this.groupSubject.next(this.groups);
  }

  private addChatFromArray(chats: Chat[]) {
    this.contacts = [];
    let chatNames = [];
    let chatIds = [];
    for (let i=0;i<chats.length;i++) {
      this.addChat(chats[i]);
      chatNames.push(chats[i].other_user.name);
      chatIds.push(chats[i].other_user.id);
    }
    this.electronService.ipcRenderer.send('chat-menu-update', [chatNames, chatIds]);
  }

  private addChat(chat: Chat) {
    this.contacts.push(chat);
    this.contactsSubject.next(this.contacts);
  }

}