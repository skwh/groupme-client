import { Component, Input, OnInit } from "@angular/core";
import { Message } from "../../models/message";

@Component({
  selector: 'app-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() message: Message;
  @Input() myUserId: number;

  isFavorited: boolean = false;
  hasImageAttachment: boolean = false;
  imageAttachmentUrl: string = "";
  hasMentionAttachment: boolean = false;

  finalText: string = "";

  ngOnInit() {
    this.finalText = this.message.text;
    if (this.message.favorited_by.indexOf(this.myUserId) != -1) {
      this.isFavorited = true;
    }
    if (this.message.attachments.length > 0) {
      for (let i=0;i<this.message.attachments.length;i++) {
        let attachment = this.message.attachments[i];
        console.log(attachment);
        if (attachment.type == "image") {
          this.hasImageAttachment = true;
          this.imageAttachmentUrl = attachment.url;
        } else if (attachment.type == "mentions") {
          this.hasMentionAttachment = true;
          for (let j=0;j<attachment.loci.length;j++) {
            let a = attachment.loci[j][0];
            let b = attachment.loci[j][1];
            let string1 = this.finalText.slice(0, a);
            let string2 = this.finalText.slice(a, b);
            let string3 = this.finalText.slice(b);
            this.finalText = string1 + "<b class='mention'>" + string2 + "</b>" + string3;
          }
        }
      }
    }
  }
}