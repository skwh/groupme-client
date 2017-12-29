import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import { Message } from "../../models/message";
import { Attachment, AttachmentType } from "../../models/attachment";

@Component({
  selector: 'app-input',
  templateUrl: 'input.component.html',
  styleUrls: ['input.component.scss']
})
export class InputComponent implements OnInit {
  @ViewChild('box') private messageInput: ElementRef;
  @Output() messageSent = new EventEmitter<Message>();

  attachBoxVisible: boolean = false;
  currentMessage: Message;

  ngOnInit() {
    this.resetMessage();
  }

  sendMessage(text: string) {
    this.currentMessage.text = text;
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
  }
}