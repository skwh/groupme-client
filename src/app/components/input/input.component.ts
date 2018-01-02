import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Message } from "../../models/message";
import { Attachment, AttachmentType } from "../../models/attachment";
import { Member } from "../../models/member";

@Component({
  selector: 'app-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.scss']
})
export class InputComponent implements OnInit {
  @ViewChild('box') private messageInput: ElementRef;

  @Input() thisUser: Member;
  @Output() messageSent = new EventEmitter<Message>();

  baseScrollHeight: number = 0;

  attachBoxVisible: boolean = false;
  currentMessage: Message;

  ngOnInit() {
    this.resetMessage();
    this.attachBoxVisible = false;
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

  sendMessage(text: string) {
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