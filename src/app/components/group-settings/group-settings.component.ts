import { Component, OnDestroy, OnInit } from "@angular/core";
import { Group } from "../../models/group";
import { StateService } from "../../providers/state.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { Member } from "../../models/member";

@Component({
  selector: 'app-group-settings',
  templateUrl: 'group-settings.component.html',
  styleUrls: ['group-settings.component.scss'],
})
export class GroupSettingsComponent implements OnInit, OnDestroy {
  constructor(private state: StateService,
              private route: ActivatedRoute,
              private router: Router) {}

  currentGroup: Group;
  currentGroupOwner: Member;
  currentGroupOwnerIsMe: boolean = false;
  groupOwnerText: string;
  groupDescriptionText: string;

  routeParamMapSubscription;

  ngOnInit() {
    this.routeParamMapSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      this.handleGroupUpdate(params);
    })
  }

  private handleGroupUpdate(params: ParamMap): void {
    if (params.has('id')) {
      let groupId = params.get('id');
      if (GroupSettingsComponent.idIsForGroup(groupId)) {
        let id = GroupSettingsComponent.getId(groupId);
        this.currentGroup = this.state.getGroupById(id);
        this.assignGroupOwner(this.currentGroup);
        return;
      }
    }
    // if the group id is malformed or doesn't exist, redirect
    // TODO(skwh): error handling for malformed group id
    this.router.navigate(['/']);
  }

  private assignGroupOwner(currentGroup: Group): void {
    let ownerId = currentGroup.creator_user_id;
    if (ownerId == this.state.currentUserId) {
      this.currentGroupOwnerIsMe = true;
    }
    let owner = this.state.getMemberFromStoreById(ownerId);
    this.currentGroupOwner = owner;
    this.createGroupInfoText();
  }

  private createGroupInfoText(): void {
    if (this.currentGroupOwner.user_id == this.state.currentUserId) {
      this.groupOwnerText = "You are the owner."
    } else {
      this.groupOwnerText = this.currentGroupOwner.nickname + " owns this group.";
    }
    if (this.currentGroup.description == null || this.currentGroup.description == undefined || this.currentGroup.description == "") {
      this.groupDescriptionText = "No description."
    } else {
      this.groupDescriptionText = "\"" + this.currentGroup.description + "\"";
    }
  }

  private static idIsForGroup(id: string): boolean {
    return id.indexOf('g') == 0;
  }

  private static getId(id: string): number {
    return parseInt(id.slice(1));
  }

  //TODO(skwh): Change confirm prompts to "undoable" actions (http://alistapart.com/article/neveruseawarning)

  mute(): void {
    this.currentGroup.muted = true;
    this.state.updateGroup(this.currentGroup.id, "muted", true);
    this.state.updateGroupsFromApi(5, false);
  }

  unmute(): void {
    this.currentGroup.muted = false;
    this.state.updateGroup(this.currentGroup.id, "muted", false);
    this.state.updateGroupsFromApi(5, false);
  }

  confirmDestroy(): void {
    if (confirm("Are you sure you want to delete this group?")) {

    }
  }

  leave(): void {
    if (confirm("Are you sure you want to leave this group?")) {

    }
  }

  makeOwner(user: Member): void {
    if (confirm("Are you sure you want to make " + user.nickname + " the owner of this group?")) {

    }
  }

  removeFromGroup(user: Member): void {
    if (confirm("Are you sure you want to remove " + user.nickname + " from this group?")) {

    }
  }

  changeAvatar(): void {
    // open upload modal
  }

  ngOnDestroy() {
    try {
      this.routeParamMapSubscription.unsubscribe();
    } catch (err) {}
  }
}