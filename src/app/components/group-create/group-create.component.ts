import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { Group } from "../../models/group";
import { Member } from "../../models/member";
import { Router } from "@angular/router";

@Component({
  selector: 'app-group-create',
  templateUrl: 'group-create.component.html',
  styleUrls: ['group-create.component.scss']
})
export class GroupCreateComponent implements OnInit {
  constructor (private state: StateService,
               private router: Router) {}

  allMembers: Member[] = [];
  addedMembers: Member[] = [];

  model: Group = new Group();

  ngOnInit() {
    this.state.getAllMembers().then((members: Member[]) => this.allMembers = members);
    this.addedMembers.push(this.state.currentUser);
  }

  addMember(member: Member): void {
    if (!this.hasBeenAdded(member)) {
      this.addedMembers.push(member);
    }
  }

  removeMember(member: Member): void {
    if (this.addedMembers.length > 1) {
      delete this.addedMembers[this.addedMembers.indexOf(member)];
    }
  }

  hasBeenAdded(member: Member): boolean {
    return this.addedMembers.indexOf(member) != -1;
  }

  onSubmit(): void {
    this.state.createGroup(this.model).then(response => {
      this.model = response;
      this.state.addUsersToGroup(this.model, this.addedMembers).then(() => {
        this.state.updateGroupsFromApi(5, true);
        this.router.navigate(['/group/', response.id]);
      }).catch(error => {
        console.log("There was an issue adding users to your new group!");
        console.error(error);
      });
    }).catch(error => {
      //TODO(skwh): hook up error ui here
      console.log("There was an issue creating a new group!");
      console.error(error);
    })
  }

  ngOnDestroy() {

  }
}