import { Component, OnDestroy, OnInit } from "@angular/core";
import { Group } from "../../models/group";
import { StateService } from "../../providers/state.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";

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
        return;
      }
    }
    // if the group id is malformed, redirect
    this.router.navigate(['/']);
  }

  private static idIsForGroup(id: string): boolean {
    return id.indexOf('g') == 0;
  }

  private static getId(id: string): number {
    return parseInt(id.slice(1));
  }

  ngOnDestroy() {
    this.routeParamMapSubscription.unsubscribe();
  }
}