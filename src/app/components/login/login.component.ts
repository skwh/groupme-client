import { Component } from "@angular/core";
import { StoreService } from "../../providers/store.service";

@Component({
  selector: 'app-login',
  templateUrl:  'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  constructor(private store: StoreService) {}

  onSubmit(keyValue: string) {
    this.store.setUserKey(keyValue);
    // redirect to groups list component
  }
}