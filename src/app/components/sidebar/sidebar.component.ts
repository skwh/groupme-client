import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { Chat } from "../../models/chat";
import { Group } from "../../models/group";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-sidebar',
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constructor(private state: StateService) {}

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
    for (let i=0;i<groups.length;i++) {
      this.addGroup(groups[i]);
    }
  }

  private addGroup(group: Group) {
    this.groups.push(group);
    this.groupSubject.next(this.groups);
  }

  private addChatFromArray(chats: Chat[]) {
    for (let i=0;i<chats.length;i++) {
      this.addChat(chats[i]);
    }
  }

  private addChat(chat: Chat) {
    this.contacts.push(chat);
    this.contactsSubject.next(this.contacts);
  }

}