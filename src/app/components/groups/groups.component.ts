import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { Group } from "../../models/group";

@Component({
  selector:'app-groups',
  templateUrl: 'groups.component.html',
  styleUrls: [ 'groups.component.scss' ]
})
export class GroupsComponent implements OnInit {
  constructor(private state: StateService) {}

  groups: Group[];
  formerGroups: Group[];

  ngOnInit() {
    this.state.getAllGroups().then(response => this.groups = response);
    this.state.getFormerGroups().then(response => this.formerGroups = response);
  }
}
