import { NgModule } from '@angular/core';
import { LoginComponent } from "./components/login/login.component"
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from "./guards/login.guard";
import { MessagesComponent } from "./components/messages/messages.component";
import { GroupsComponent } from "./components/groups/groups.component";
import { MembersComponent } from "./components/members/members.component";
import { GroupSettingsComponent } from "./components/group-settings/group-settings.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [ LoginGuard ],
    children: [
      {
        path: '',
        component: MessagesComponent
      },
      {
        path: 'group/:id',
        component: MessagesComponent
      },
      {
        path: 'group/:id/settings',
        component: GroupSettingsComponent,
      },
      {
        path: 'chat/:id',
        component: MessagesComponent
      },
      {
        path: 'groups',
        component: GroupsComponent
      },
      {
        path: 'members',
        component: MembersComponent
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
