import { app, BrowserWindow, ipcMain, Menu, MenuItem, webContents } from 'electron';
import { gmgMenu } from "./src/electron/gmgMenu";
import { FixedSizeArray } from "./src/electron/util";

export class gmgApp {
  win: Electron.BrowserWindow;
  serve: boolean;
  menu: gmgMenu;
  electronApp: Electron.App;
  currentAngularRoute: string = '/';
  currentGroupId: number = -1;
  currentChatId: number = -1;
  currentGroups: number[] = [];
  currentChats: number[] = [];
  currentChannelIndex: number = -1;
  lastChannelId: FixedSizeArray<number>;
  lastChannelType: FixedSizeArray<string>;

  constructor(app: Electron.App) {
    this.electronApp = app;
    this.lastChannelType = new FixedSizeArray<string>(2);
    this.lastChannelId = new FixedSizeArray<number>(2);
  }

  initialize(): void {
    this.menu = new gmgMenu();
    const args = process.argv.slice(1);
    this.serve = args.some(val => val === '--serve');

    if (this.serve) {
      require('electron-reload')(__dirname, {
      });
    }
    this.createWindow();

    ipcMain.on('group-menu-update', (event, args: any[]) => {
      this.menu.setGroupDetails(args[0], args[1], event.sender.id);
    });

    ipcMain.on('chat-menu-update', (event, args: any[]) => {
      this.menu.setChatDetails(args[0], args[1], event.sender.id);
    });
    ipcMain.on('route-update', (event, args: any[]) => {
      this.updateRouteInformation(args[0]);
    });
    ipcMain.on('groups-list-update', (event, args: any[]) => {
      console.log(this.currentGroups);
      this.currentGroups = args[0];
    });
    ipcMain.on('chats-list-update', (event, args: any[]) => {
      console.log(this.currentChats);
      this.currentChats = args[0];
    })
  }

  private updateRouteInformation(route: string): void {
    this.currentAngularRoute = route;
    if (route.indexOf('group') !== -1 && route.indexOf('new') === -1 && route.indexOf('settings') === -1) {
      this.lastChannelType.push('group');
      this.currentGroupId = Number(route.substring(route.indexOf('/group/') + 7));
      this.currentChannelIndex = this.currentGroups.indexOf(this.currentGroupId);
      this.lastChannelId.push(this.currentGroupId);
    } else if (route.indexOf('chat') !== -1 && route.indexOf('new') === -1 && route.indexOf('settings') === -1) {
      this.lastChannelType.push('chat');
      this.currentChatId = Number(route.substring(route.indexOf('/chat/') + 6));
      this.currentChannelIndex = this.currentChats.indexOf(this.currentChatId) + 5;
      this.lastChannelId.push(this.currentChatId);
    } else {
      this.currentChannelIndex = -1;
    }
  }

  createWindow(): void {
    // Create the browser window.
    this.win = new BrowserWindow({
      x: 100,
      y: 100,
      width: 950,
      height: 650,
      resizable: false,
      backgroundColor: '#fefefe',
      show: false,
      title: app.getName(),
    });

    this.win.once('ready-to-show', () => {
      this.win.show();
    });

    this.menu.firstTimeGenerateMenu();

    // and load the index.html of the app.
    this.win.loadURL('file://' + __dirname + '/index.html');

    // Open the DevTools.
    if (this.serve) {
      this.win.webContents.openDevTools();
    }

    this.win.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    });

    // Emitted when the window is closed.
    this.win.on('closed', () => {
      // Dereference the window object, usually you would store window
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      this.win = null;
    });
  }

  makeSingleInstance(): boolean {
    if (process.mas) return false;

    return app.makeSingleInstance(() => {
      if (this.win) {
        if (this.win.isMinimized()) this.win.restore();
        this.win.focus();
      }
    })
  }

  static navigateToGroup(id: number, senderId: number): void {
    gmgApp.navigateTo(senderId, 'group/'+id);
  }

  static navigateToChat(id: number, senderId: number) : void {
    gmgApp.navigateTo(senderId,'chat/'+id);
  }

  static navigateTo(senderId: number, path: string): void {
    gmgApp.sendNavigationMessage(webContents.fromId(senderId), path);
  }

  static sendNavigationMessage(sender: Electron.WebContents, angularRelativePath: string): void {
    sender.send('navigate-to', [angularRelativePath]);
  }

}

export let GMG_APP_INSTANCE: gmgApp;
(function() {
  try {
    GMG_APP_INSTANCE = new gmgApp(app);
    if (GMG_APP_INSTANCE.makeSingleInstance()) app.quit();
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => GMG_APP_INSTANCE.initialize());

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (GMG_APP_INSTANCE.win === null) {
        GMG_APP_INSTANCE.createWindow();
      }
    });

  } catch (e) {
    // Catch Error
    console.error(e);
  }
})();