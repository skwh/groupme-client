import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Message } from "../../models/message";
import { Attachment, AttachmentType } from "../../models/attachment";
import { Member } from "../../models/member";
import { StateService } from "../../providers/state.service";

@Component({
  selector: 'app-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.scss']
})
export class InputComponent implements OnInit {
  constructor(private state: StateService) {}

  @ViewChild('box') private messageInput: ElementRef;

  @Input() thisUser: Member;
  @Input() currentChannelIsGroup: boolean;
  @Output() messageSent = new EventEmitter<Message>();

  baseScrollHeight: number = 0;

  attachBoxVisible: boolean = false;
  currentMessage: Message;

  currentGroupMembers: Member[];

  ngOnInit() {
    this.resetMessage();
    this.attachBoxVisible = false;
    this.currentGroupMembers = [this.thisUser];
    if (this.currentChannelIsGroup) {
      let groupId = parseInt(this.state.currentChannelId.slice(1));
      this.state.getGroupById(groupId, true).then(group => {
        this.currentGroupMembers = group.members;
      });
    }
  }

  textareaFocus(): void {
    let savedValue = this.messageInput.nativeElement.value;
    this.messageInput.nativeElement.value = "";
    this.baseScrollHeight = this.messageInput.nativeElement.scrollHeight;
    this.messageInput.nativeElement.value = savedValue;
  }

  textareaInput(): void {
    let minRows = this.messageInput.nativeElement.getAttribute('data-min-rows') | 0, rows;
    this.messageInput.nativeElement.rows = minRows;
    let calc = (this.messageInput.nativeElement.scrollHeight - this.baseScrollHeight) / 16;
    rows = Math.ceil(calc);
    this.messageInput.nativeElement.rows = minRows + rows;
  }

  // autoexpanding textarea code comes from https://codepen.io/vsync/pen/frudD

  mentionAlert: boolean = false;
  showMentions: boolean = false;
  mentionString: string = "";
  mentionedUser: Member;

  //TODO(skwh): Refactor mentions logic
  detectMention(keyEvent: KeyboardEvent): void {
    if (keyEvent.key == "@") {
      this.mentionAlert = true;
    } else if (this.mentionAlert) {
      if (keyEvent.key == "Tab") {
        this.addMention();
      } else if (keyEvent.key == "Backspace") {
        if (this.mentionString.length > 0) {
          this.mentionString = this.mentionString.slice(0, this.mentionString.length - 1);
          if (this.mentionString.length == 0) {
            this.showMentions = false;
          }
        } else {
          this.hideMentionBox();
        }
      } else if (keyEvent.key != "Shift" &&
          keyEvent.key != "Control" &&
          keyEvent.key != "Meta" &&
          keyEvent.key != "Alt") {
        // add the character to the name to search for
        this.mentionString += keyEvent.key;
      }
      // show the mention box after one character
      if (this.mentionString.length > 1) {
        this.showMentions = true;
      }
    } else {
      this.hideMentionBox();
    }
    if (this.messageInput.nativeElement.value == "") {
      this.hideMentionBox();
    }
    if (this.messageInput.nativeElement.value.indexOf("@") == -1 && this.countMessageAttachments() > 0) {

    }
  }

  addMention(): void {
    //remove the previous string from the chat
    let loci = this.removeMentionStringFromValue();
    //close the mention box
    this.hideMentionBox();
    this.mentionString = "";
    //add the mention as an attachment
    this.addMentionAttachment(loci);
  }

  removeMentionStringFromValue(): number[] {
    let oldValue = this.messageInput.nativeElement.value;
    let atIndex = oldValue.indexOf('@');
    this.messageInput.nativeElement.value = oldValue.slice(0, atIndex+1) + oldValue.slice(atIndex + this.mentionString.length+1);
    //paste the selected name in the chat
    this.messageInput.nativeElement.value += this.mentionedUser.nickname;
    return [atIndex+1, atIndex + this.mentionedUser.nickname.length];
  }

  addMentionAttachment(loci: number[]): void {
    let attachment = new Attachment();
    attachment.type = AttachmentType.Mention;
    attachment.user_ids.push(this.mentionedUser.user_id);
    attachment.loci.push(loci);
    this.currentMessage.attachments.push(attachment);
  }

  countMessageAttachments(): number {
    let sum = 0;
    for (let i=0;i<this.currentMessage.attachments.length;i++) {
      if (this.currentMessage.attachments[i].type == AttachmentType.Mention) {
        sum++;
      }
    }
    return sum;
  }

  hideMentionBox(): void {
    this.mentionAlert = false;
    this.showMentions = false;
  }

  getMention(mentionUser: Member): void {
    this.mentionedUser = mentionUser;
  }

  sendMessage(event, text: string) {
    event.preventDefault();
    text = text.slice(0, text.length-1);
    this.currentMessage.text = text;
    this.currentMessage.name = this.thisUser.name;
    this.currentMessage.avatar_url = this.thisUser.avatar_url;
    this.currentMessage.user_id = this.thisUser.user_id;
    this.messageInput.nativeElement.value = "";
    this.messageSent.emit(this.currentMessage);
    this.resetMessage();
  }

  handleCancel() {
    this.attachBoxVisible = false;
  }

  handleAttach(event) {
    // show the attachment in the input box

    // add the attachment to the message which is going to be sent
    let attachment = new Attachment();
    attachment.type = AttachmentType.Image;
    attachment.url = event;
    this.currentMessage.attachments.push(attachment);
    // close the attach box
    this.attachBoxVisible = false;
  }

  showAttachBox(): void {
    this.attachBoxVisible = true;
  }

  removeAttachments(): void {
    if (this.currentMessage.attachments.length > 0 && confirm("Are you sure you want to remove the attachment from this message?")) {
      this.currentMessage.attachments = [];
    }
  }

  private resetMessage(): void {
    this.currentMessage = new Message();
    this.messageInput.nativeElement.rows = 1;
  }
}