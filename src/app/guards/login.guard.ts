import { Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router } from "@angular/router";
import { StateService } from "../providers/state.service";

@Injectable()
export class LoginGuard implements CanActivate, CanActivateChild {

  constructor(private state: StateService, private router: Router) {}

  canActivate() {
    if (!this.state.accessTokenIsEmpty()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

  canActivateChild() {
    return this.canActivate();
  }
}