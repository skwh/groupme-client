import { Component, OnInit } from "@angular/core";
import { StateService } from "../../providers/state.service";

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor (private state: StateService) {}

  settings: Object;

  ngOnInit() {
    this.settings = this.state.getAllSettings();
  }
}