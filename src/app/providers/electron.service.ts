import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer } from 'electron';
import * as childProcess from 'child_process';
import { Router } from "@angular/router";

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  childProcess: typeof childProcess;

  constructor(private router: Router) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.childProcess = window.require('child_process');
    }

    ipcRenderer.on('navigate-to', (event, args) => {
      //args[0] is the path to navigate to
      router.navigate([args[0]]);
    });

  }

  isElectron = () => {
    return window && window.process && window.process.type;
  }

}
