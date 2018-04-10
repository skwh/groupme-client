import { Component, OnInit } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { StoreService } from "./providers/store.service";
import { NotificationService } from "./providers/notification.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public electronService: ElectronService, private store: StoreService, private notification: NotificationService) {

    if (electronService.isElectron()) {
      console.log('Mode electron');
      // Check if electron is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.ipcRenderer);
      // Check if nodeJs childProcess is correctly injected (see externals in webpack.config.js)
      console.log('c', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
    this.notification.doSetup();
  }

  ngOnInit() {
  }
}
