import { Menu } from "electron";
import { GMG_APP_INSTANCE, gmgApp } from "../../main";
import { copy } from "./util";

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

export class gmgMenu {
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
            gmgApp.navigateTo(gmgMenu.senderId, 'groups');
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
            gmgApp.navigateTo(gmgMenu.senderId, 'members');
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

  private darwinMenuTemplate: Electron.MenuItemConstructorOptions = {
    label: GMG_APP_INSTANCE.electronApp.getName(),
    submenu: [
      {role: 'about'},
      {
        label: 'Settings',
        accelerator: 'CmdOrCtrl+,',
        click() {
          gmgApp.navigateTo(gmgMenu.senderId, 'settings');
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
          gmgApp.navigateToGroup(currentGroupId, senderId);
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
          gmgApp.navigateToChat(currentChatId, senderId);
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
      template.unshift(this.darwinMenuTemplate);
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