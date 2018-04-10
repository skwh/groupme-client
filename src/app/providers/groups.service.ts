import { Injectable } from "@angular/core";
import { StateService } from "./state.service";
import { Message } from "../models/message";
import { Group } from "../models/group";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/merge";

@Injectable()
export class GroupsService {
  constructor(private state: StateService) {
    this.groupMessages$ = this.groupMessages$.merge(this.state.messages$);
    this.state.groups$.subscribe((value: Group[]) => {
      this.mostRecentGroups.unshift(...value);
      this.mostRecentGroups = this.mostRecentGroups.slice(0, 5);
    })
  }

  currentGroupId: number = 0;

  groupMessagesSubject: Subject<Message[]> = new Subject();
  groupMessages$: Observable<Message[]> = this.groupMessagesSubject.asObservable();

  mostRecentGroups: Array<Group>;

  sendMessage(message: Message): Promise<boolean> {
    return this.state.sendMessageToGroup(this.currentGroupId, message);
  }

  updateMessagesFromBeforeMessage(messageId: number): void {
    this.state.updateGroupMessagesFromApiBeforeMessage(this.currentGroupId, messageId);
  }

  loadLatestMessages(): void {
    this.state.updateGroupMessagesFromApi(this.currentGroupId);
  }
}