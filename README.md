# gmg - a GroupMe Client

This project is a fully-featured GroupMe client for the desktop.

It makes use of Electron, Angular 4, and GroupMe's extensive public-facing API and push messaging system to function.

## Features

gmg is a fully-featured GroupMe client, meaning you can do (almost) anything here that you would be able to in the Web or Mobile versions of GroupMe.

Currently implemented features:

- See messages from Groups and directly from other users (DMs).
- Send messages to those Groups and users, including image attachments.
- Like / Favorite messages in Groups and DMs.
- Get desktop notifications when new messages are delivered to your Groups and DMs.
- Change the title, description, and avatar for your Groups.
- Remove users from your Groups.

Features planned for Version 1:

- Create new groups
- Mention other users in your messages
- Use keyboard shortcuts to navigate through the app
- Native menus for navigating and interacting with the app
- Settings page for configuring the app

Features planned for Version 2: 

- Responsive design; resize the window as you please
- See previews of the image you've attached to your message
- Add GIPHY gifs and Emojis to your messages
- Edit your GroupMe profile, including avatar
- User blocks

Some parts of GroupMe that probably won't be implemented in gmg:

- Location attachments (impractical on a desktop app)
- Like scoreboards (relatively unknown feature of GroupMe)
- Parts of the API that I don't understand, like ["splits"](https://dev.groupme.com/docs/v3#messages_create) 


## Installation and Usage 

An installation guide will be provided when v0.9 is reached.

## Reporting Bugs

If you have a Github account, great! Please report bugs using the issues feature here in the repo. Make sure to tag your issue with "bug".

If you don't have a Github account, I'm not going to make you get one. Please [send me an email](mailto:somekidwithhtml@gmail.com) and include "gmg bug" in the subject line.

**No matter how you are reporting the bug, please include the following in your bug report:**

- Which version of gmg you are using
- Your Operating System (OS): macOS, Win 7/8/10, etc.
- What happened when you encountered the bug
- What you expected to happen
- If you saw any error messages appear

## Contributing

If you would like to contribute to the project, a few things you should know:

1) Until Version 1, the repo will be using a "release" branch style of repo versioning - the code in the master branch is the most unstable version of the code.
2) After Version 1 is released, the repo will shift to a "feature" branch style of versioning - the master branch will be the most stable version of the code, and new features will be introduced in their own branches. 

Also, my code is pretty messy. So feel free to do some cleanup. I also need to write tests.

## Credits

Thanks a bunch to GroupMe itself for having such a huge and robust API.

Most of the setup code for this project came from Maxime Gris' ["Angular Electron" repo](https://github.com/maximegris/angular-electron). Thanks for doing the setup for me!

The textarea autoexpanding code came from [this codepen](https://codepen.io/vsync/pen/frudD) by CodePen user Vsync.  