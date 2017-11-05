import { NgModule } from '@angular/core';
import { LoginComponent } from "./components/login/login.component"
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from "./guards/login.guard";
import { MessagesComponent } from "./components/messages/messages.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [ LoginGuard ],
    children: [
      {
        path: '',
        component: MessagesComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
