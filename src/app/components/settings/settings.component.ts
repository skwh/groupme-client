import { Component, OnInit, ViewChild } from "@angular/core";
import { StateService } from "../../providers/state.service";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor (private state: StateService,
               private router: Router) {}

  @ViewChild('settingsForm') form: NgForm;

  settings: Object;

  ngOnInit() {
    this.settings = this.state.getAllSettings();
    this.form.valueChanges.subscribe(() => {
      this.state.setSettings(this.settings);
    });
  }

  signOut():void {
    this.state.clearStore();
    document.location.reload(true);
  }
}