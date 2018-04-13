import { NgModule } from '@angular/core';
import { LoginComponent } from "./components/login/login.component"
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from "./guards/login.guard";
import { MessagesComponent } from "./components/messages/messages.component";
import { GroupsComponent } from "./components/groups/groups.component";
import { MembersComponent } from "./components/members/members.component";
import { GroupSettingsComponent } from "./components/group-settings/group-settings.component";
import { SettingsComponent } from "./components/settings/settings.component";
import { GroupMessagesComponent } from "./components/group-messages/group-messages.component";
import { ChatMessagesComponent } from "./components/chat-messages/chat-messages.component";
import { GroupCreateComponent } from "./components/group-create/group-create.component";

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
        path: 'group/new',
        component: GroupCreateComponent,
      },
      {
        path: 'group/:id/settings',
        component: GroupSettingsComponent,
      },
      {
        path: 'group/:id',
        component: GroupMessagesComponent
      },
      {
        path: 'chat/:id',
        component: ChatMessagesComponent
      },
      {
        path: 'groups',
        component: GroupsComponent
      },
      {
        path: 'members',
        component: MembersComponent
      },
      {
        path: 'settings',
        component: SettingsComponent
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
