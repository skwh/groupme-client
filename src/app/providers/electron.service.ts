import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer } from 'electron';
import * as childProcess from 'child_process';
import { NavigationStart, Router } from "@angular/router";
import { StateService } from "./state.service";
import { Group } from "../models/group";
import { Chat } from "../models/chat";

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  childProcess: typeof childProcess;

  constructor(private router: Router,
              private state: StateService) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.childProcess = window.require('child_process');
    }

    this.router.events.subscribe((event: NavigationStart) => {
      if (event instanceof NavigationStart) {
        ipcRenderer.send('route-update', [event.url]);
      }
    });

    this.state.groups$.subscribe((groups: Group[]) => {
      let ids = [];
      for (let group of groups) {
        ids.push(Number(group.id));
      }
      ipcRenderer.send('groups-list-update', [ids]);
    });

    this.state.chats$.subscribe((chats: Chat[]) => {
      let ids = [];
      for (let chat of chats) {
        ids.push(Number(chat.other_user.id));
      }
      ipcRenderer.send('chats-list-update', [ids]);
    });

    ipcRenderer.on('navigate-to', (event, args) => {
      //args[0] is the path to navigate to
      router.navigate([args[0]]);
    });

  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
