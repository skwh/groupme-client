import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
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
  myUserId: number;

  modalOpen: boolean = false;
  oldImageUrl: string;

  routeParamMapSubscription;

  detailsEdited: boolean = false;
  @ViewChild('groupName') private groupName: ElementRef;
  @ViewChild('groupDescription') private groupDescription: ElementRef;

  ngOnInit() {
    this.routeParamMapSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      this.handleGroupUpdate(params);
    });
    this.myUserId = this.state.currentUserId;
  }

  private handleGroupUpdate(params: ParamMap): void {
    if (params.has('id')) {
      let groupId = Number(params.get('id'));
      this.state.getGroupById(groupId, true).then(response => {
        this.currentGroup = response;
        this.oldImageUrl = this.currentGroup.image_url;
        this.assignGroupOwner(this.currentGroup);
      });
      return;
    }
    // if the group id is malformed or doesn't exist, redirect
    // TODO(skwh): error handling for malformed group id
    this.router.navigate(['/']);
  }

  private assignGroupOwner(currentGroup: Group): void {
    // TODO(skwh): investigate bug with groups not having a creator_user_id.
    try {
      let ownerId = currentGroup.creator_user_id;
      if (ownerId == this.state.currentUserId) {
        this.currentGroupOwnerIsMe = true;
      }
      this.currentGroupOwner = this.state.getMemberFromStoreById(ownerId);
      this.createGroupOwnerText();
    } catch (err) {
      console.error(err);
    }
    this.createGroupInfoText();
  }

  private createGroupOwnerText(): void {
    if (this.currentGroupOwner != null && this.currentGroupOwner.user_id == this.state.currentUserId) {
      this.groupOwnerText = "You are the owner."
    } else {
      this.groupOwnerText = this.currentGroupOwner.nickname + " owns this group.";
    }
  }

  private createGroupInfoText(): void {
    if (this.currentGroup.description == null || this.currentGroup.description == undefined || this.currentGroup.description == "") {
      this.groupDescriptionText = "No description."
    } else {
      this.groupDescriptionText = this.currentGroup.description;
    }
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
      this.state.destroyGroup(this.currentGroup.id).then(() => {
        alert("The group has been deleted.");
        this.state.updateGroupsFromApi(5, true);
        this.router.navigate(['/groups']);
      })
    }
  }

  private getMyMembershipId(): number {
    for (let i=0;i<this.currentGroup.members.length;i++) {
      let currentMember = this.currentGroup.members[i];
      if (currentMember.user_id == this.state.currentUserId) {
        return currentMember.id;
      }
    }
    return 0;
  }

  leave(): void {
    if (confirm("Are you sure you want to leave this group?")) {
      let myMembershipId = this.getMyMembershipId();
      if (myMembershipId != 0) {
        this.state.leaveGroup(this.currentGroup.id, myMembershipId).then(() => {
          alert("You have left the group.");
          this.state.updateGroupsFromApi(5, true);
          this.router.navigate(['/']);
        });
      } else {
        alert("Something went wrong.");
      }
    }
  }

  makeOwner(user: Member): void {
    if (confirm("Are you sure you want to make " + user.nickname + " the owner of this group?")) {
      this.state.makeGroupOwner(this.currentGroup.id, user.user_id).then(() => {
        alert(user.nickname + " was made an owner of the group.");
        this.router.navigate(['/group', this.currentGroup.id, 'settings']);
      });
    }
  }

  removeFromGroup(user: Member): void {
    if (confirm("Are you sure you want to remove " + user.nickname + " from this group?")) {
      this.state.removeUserFromGroup(this.currentGroup.id, user.id).then(() => {
        alert(user.nickname + " has been removed from " + this.currentGroup.name + ".");
        this.router.navigate(['/group', this.currentGroup.id, 'settings']);
      })
    }
  }

  setUpdated(): void {
    console.log("Changed!");
    this.detailsEdited = true;
  }

  saveGroupChanges(): void {
    if (confirm("Are you sure you want to save the changes you made?")) {
      // TODO(skwh): Remove magic string
      if (this.groupDescription.nativeElement.innerText != "No description.") {
        this.currentGroup.description = this.groupDescription.nativeElement.innerText;
      }
      this.state.updateGroupToAPI(this.currentGroup.id,
                                  this.groupName.nativeElement.innerText,
                                  this.currentGroup.description,
                                  this.currentGroup.image_url)
          .then(() => {
        alert("Group details updated.");
        this.detailsEdited = false;
        this.state.updateGroupsFromApi(5, true);
        this.router.navigate(['/group', this.currentGroup.id, 'settings']);
      })
    }
  }

  changeAvatar(): void {
    this.modalOpen = true;
  }

  handleAvatarUpdated(image_url: string): void {
    this.currentGroup.image_url = image_url;
    this.setUpdated();
  }

  cancelUpdateAvatar(): void {
    this.currentGroup.image_url = this.oldImageUrl;
    this.modalOpen = false;
  }

  confirmChange(): void {
    this.modalOpen = false;
  }

  ngOnDestroy() {
    try {
      this.routeParamMapSubscription.unsubscribe();
    } catch (err) {}
  }
}