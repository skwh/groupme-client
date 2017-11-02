import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate() {
    console.log("LoginGuard#canActivate called!");
    return true;
  }
}