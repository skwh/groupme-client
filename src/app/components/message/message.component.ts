import { Component, Input, OnInit } from "@angular/core";
import { Message } from "../../models/message";
import { Attachment } from "../../models/attachment";

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
        if (attachment.type == "image") {
          this.hasImageAttachment = true;
          this.imageAttachmentUrl = attachment.url;
        } else if (attachment.type == "mentions") {
          this.hasMentionAttachment = true;
          this.finalText = this.createMentionAttachment(this.finalText, attachment);
        }
      }
    }
  }

  private createMentionAttachment(finalText: string, attachment: Attachment): string {
    let newText = finalText;
    for (let i=0;i<attachment.loci.length;i++) {
      let a = attachment.loci[i][0];
      let b = attachment.loci[i][1];
      let string1 = finalText.slice(0, a);
      let string2 = finalText.slice(a, b);
      let string3 = finalText.slice(b);
      newText = string1 + "<b class='mention'>" + string2 + "</b>" + string3;
    }
    return newText;
  }
}