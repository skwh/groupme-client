import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { StateService } from "../../providers/state.service";

@Component({
  selector: 'app-login',
  templateUrl:  'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  constructor(private state: StateService, private router: Router) {}

  valid: boolean = true;

  onSubmit(keyValue: string) {
    if (keyValue != "") {
      this.state.validateUserKey(keyValue).then(response => {
        if (response) {
          this.state.doFirstTimeSetup(keyValue);
          this.router.navigate(['']);
        } else {
          //show an error message
          this.valid = false;
        }
      })
    }
  }
}