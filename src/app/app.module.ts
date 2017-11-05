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
import { GroupmeMockService } from "./providers/groupme-mock.service";
import { StateService } from "./providers/state.service";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MessagesComponent } from "./components/messages/messages.component";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SidebarComponent,
    MessagesComponent
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
    {provide: GroupmeService, useClass: GroupmeMockService},
    StateService,
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
