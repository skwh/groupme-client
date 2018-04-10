import { app, BrowserWindow, ipcMain, Menu, MenuItem, webContents } from 'electron';

function copy(o) {
  let output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object") ? copy(v) : v;
  }
  return output;
}

/*
Menus:
(OSX Application Menu) gmg:
- About gmg
- Preferences (or settings) (Cmd + ,)
- Quit (Cmd + Q)
File:
- New Chat (Cmd + Shift + n)
- New Group (Cmd + Shift + Option + n)
- Close Window (Cmd + w)
Edit:
- Undo (Cmd + z)
- Redo (Cmd + Shift + z)
- Cut (Cmd + x)
- Copy (Cmd + c)
- Paste (Cmd + v)
- Select All (Cmd + a)
- Add Attachment (Cmd + n)
Groups:
- [Most recent group] (Cmd + 1)
- [Least recent group] (Cmd + 5)
- New Group (Cmd + Shift + n)
- Settings for current group (Cmd + /) (only works if a group is open)
- Show list of groups (Cmd + G)
Chats:
- [Most recent chat] (Cmd + 6)
- [Least recent chat] (Cmd + 0)
- New Chat (Cmd + Shift + Option + n)
- Show list of chats (Cmd + M)
Window:
- Select Last Channel (Cmd + Option + [)
- Select Next Channel (Cmd + Option + ])
 */

class gmgMenu {
  private groupNamesList: string[];
  private groupIdsList: number[];
  public static templateGroupsIndex: number = 2;

  private chatNamesList: string[];
  private chatIdsList: number[];
  public static templateChatsIndex: number = 3;

  private static senderId = 1;

  private static menuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'},
        {type: 'separator'},
        {
          label: 'Add Attachment',
          accelerator: 'CmdOrCtrl+N',
          click () {
            //TODO(skwh): implement "Add attachment" shortcut
            // navigateTo(gmgMenu.senderId, );
          }
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
      ]
    },
    {
      label: 'Groups',
      submenu: [
        {
          label: 'New Group',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+Option+N' : 'Ctrl+Shift+Alt+N',
          click () {
            //TODO(skwh): implement "New Group" shortcut
          }
        },
        {
          label: 'Settings for Current Group',
          accelerator: 'CmdOrCtrl+/',
          click () {
            //TODO(skwh): implement "current group settings" shortcut
          }
        },
        {
          label: 'Show List of Groups',
          accelerator: 'CmdOrCtrl+G',
          click () {
            navigateTo(gmgMenu.senderId, 'groups');
          }
        }
      ]
    },
    {
      label: 'Chats',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'CmdOrCtrl+Shift+N',
          click () {
            //TODO(skwh): implement "New Chat" shortcut
          }
        },
        {
          label: 'Show List of Chats',
          accelerator: 'CmdOrCtrl+M',
          click () {
            navigateTo(gmgMenu.senderId, 'members');
          }
        },
      ]
    },
    {
      label: 'Channel',
      submenu: [
        {
          label: 'Next Group/Chat',
          accelerator: 'CmdOrCtrl+]',
          click () {
            //TODO(skwh): implement "Next Channel" shortcut
          }
        },
        {
          label: 'Previous Group/Chat',
          accelerator: 'CmdOrCtrl+[',
          click () {
            //TODO(skwh): implement "Last Channel" shortcut
          }
        },
        {
          label: "Jump to Last Group/Chat",
          accelerator: 'Shift+CmdOrCtrl+~',
          click() {
            //TODO(skwh): implement "Jump to last group/chat" shortcut
          }
        }
      ]
    },
    {role:'windowMenu'}
  ];

  private static darwinMenuTemplate: Electron.MenuItemConstructorOptions = {
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click() {
          navigateTo(gmgMenu.senderId, 'settings');
        }
      },
      {type: 'separator'},
      {role: 'hide'},
      {type: 'separator'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  };

  constructor() {
    this.groupNamesList = [];
    this.groupIdsList = [];
    this.chatNamesList = [];
    this.chatIdsList = [];
  }

  setGroupDetails(names: string[], ids: number[], senderId: number): void {
    this.groupNamesList = names;
    this.groupIdsList = ids;
    gmgMenu.senderId = senderId;
    this.generateTemplate(senderId);
  }

  setChatDetails(names: string[], ids: number[], senderId: number): void {
    this.chatNamesList = names;
    this.chatIdsList = ids;
    gmgMenu.senderId = senderId;
    this.generateTemplate(senderId);
  }

  static setLatestInTemplate(template: Electron.MenuItemConstructorOptions[], items: Electron.MenuItemConstructorOptions[], offset: number): Electron.MenuItemConstructorOptions[] {
    (template[offset].submenu as Array<Electron.MenuItemConstructorOptions>).unshift({ type: 'separator' });
    (template[offset].submenu as Array<Electron.MenuItemConstructorOptions>).unshift(...items);
    return template;
  }

  createGroupsTemplate(template: Electron.MenuItemConstructorOptions[], senderId: number): Electron.MenuItemConstructorOptions[] {
    let groupButtons: Electron.MenuItemConstructorOptions[] = [];
    for (let i=0;i<this.groupNamesList.length;i++) {
      let currentGroupId = this.groupIdsList[i];
      let groupButton = {
        label: this.groupNamesList[i],
        accelerator: 'CmdOrCtrl+'+(i+1),
        click() {
          navigateToGroup(currentGroupId, senderId);
        }
      };
      groupButtons.push(groupButton);
    }
    return gmgMenu.setLatestInTemplate(template, groupButtons, gmgMenu.templateGroupsIndex);
  }

  createChatsTemplate(template: Electron.MenuItemConstructorOptions[], senderId: number): Electron.MenuItemConstructorOptions[] {
    let chatButtons: Electron.MenuItemConstructorOptions[] = [];
    for (let i=0;i<this.chatNamesList.length;i++) {
      let currentChatId = this.chatIdsList[i];
      let chatButton = {
        label: this.chatNamesList[i],
        accelerator: 'CmdOrCtrl+'+((i+6) % 10),
        click() {
          navigateToChat(currentChatId, senderId);
        }
      };
      chatButtons.push(chatButton);
    }
    return gmgMenu.setLatestInTemplate(template, chatButtons, gmgMenu.templateChatsIndex);
  }

  generateTemplate(senderId: number): void {
    let newTemplate = copy(gmgMenu.menuTemplate);
    newTemplate = this.createGroupsTemplate(this.createChatsTemplate(newTemplate, senderId), senderId);
    gmgMenu.createMenuFromTemplate(newTemplate);
  }

  firstTimeGenerateMenu(): void {
    let template = gmgMenu.menuTemplate;
    if (process.platform === 'darwin') {
      template.unshift(gmgMenu.darwinMenuTemplate);
      gmgMenu.templateChatsIndex++;
      gmgMenu.templateGroupsIndex++;
    }
    gmgMenu.createMenuFromTemplate(template);
  }

  static createMenuFromTemplate(template: Electron.MenuItemConstructorOptions[]): void {
    const menuObj = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menuObj);
  }
}

function navigateToGroup(id: number, senderId: number): void {
  navigateTo(senderId, 'group/'+id);
}

function navigateToChat(id: number, senderId: number) : void {
  navigateTo(senderId,'chat/'+id);
}

function navigateTo(senderId: number, path: string): void {
  sendNavigationMessage(webContents.fromId(senderId), path);
}

function sendNavigationMessage(sender: Electron.WebContents, angularRelativePath: string): void {
  sender.send('navigate-to', [angularRelativePath]);
}

ipcMain.on('group-menu-update', (event, args: any[]) => {
  gmgMenuObj.setGroupDetails(args[0], args[1], event.sender.id);
});

ipcMain.on('chat-menu-update', (event, args: any[]) => {
  gmgMenuObj.setChatDetails(args[0], args[1], event.sender.id);
});

let win, serve;
const gmgMenuObj = new gmgMenu();
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
  require('electron-reload')(__dirname, {
  });
}

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    x: 100,
    y: 100,
    width: 950,
    height: 650,
    resizable: false,
    backgroundColor: '#fefefe',
    show: false,
    title: app.getName(),
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  gmgMenuObj.firstTimeGenerateMenu();

  // and load the index.html of the app.
  win.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  if (serve) {
    win.webContents.openDevTools();
  }

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });



  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
}

function makeSingleInstance(): boolean {
  if (process.mas) return false;

  return app.makeSingleInstance(() => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  })
}

function initialize(): void {
  try {
    if (makeSingleInstance()) app.quit();
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

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
      if (win === null) {
        createWindow();
      }
    });

  } catch (e) {
    // Catch Error
    // throw e;
  }
}

initialize();
