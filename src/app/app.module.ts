import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import 'polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from "@angular/common/http"

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';

import { ElectronService } from './providers/electron.service';
import { GroupmeService } from "./providers/groupme.service";
import { LoginComponent } from "./components/login/login.component";
import { StoreService } from "./providers/store.service";
import { LoginGuard } from "./guards/login.guard";
import { StateService } from "./providers/state.service";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MessagesComponent } from "./components/messages/messages.component";
import { MessageComponent } from "./components/message/message.component";
import { ReversePipe } from "./pipes/reverse.pipe";
import { InputComponent } from "./components/input/input.component";
import { FayeService } from "./providers/faye.service";
import { GroupsComponent } from "./components/groups/groups.component";
import { MembersComponent } from "./components/members/members.component";
import { TruncatePipe } from "./pipes/truncate.pipe";
import { AlphabetizePipe } from "./pipes/alphabetize.pipe";
import { InitialsPipe } from "./pipes/initials.pipe";
import { GroupSettingsComponent } from "./components/group-settings/group-settings.component";
import { ListItemComponent } from "./components/list-item/list-item.component";
import { ImageUploadComponent } from "./components/image-upload/image-upload.component";
import { AttachComponent } from "./components/attach/attach.component";

@NgModule({
  declarations: [
    AppComponent,
    ListItemComponent,
    LoginComponent,
    SidebarComponent,
    MessagesComponent,
    MessageComponent,
    InputComponent,
    GroupsComponent,
    MembersComponent,
    GroupSettingsComponent,
    ImageUploadComponent,
    AttachComponent,
    ReversePipe,
    TruncatePipe,
    AlphabetizePipe,
    InitialsPipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    ElectronService,
    StoreService,
    {provide: GroupmeService, useClass: GroupmeService},
    StateService,
    FayeService,
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
