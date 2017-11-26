import { Component, Input, OnInit } from "@angular/core";
import { Message } from "../../models/message";
import { Attachment, AttachmentType } from "../../models/attachment";
import { StateService } from "../../providers/state.service";
import { isUndefined } from "util";

@Component({
  selector: 'app-message',
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.scss']
})
export class MessageComponent implements OnInit {
  constructor(private state: StateService) {}

  @Input() message: Message;
  @Input() myUserId: number;
  @Input() conversationId: number;

  isFavorited: boolean = false;
  hasImageAttachment: boolean = false;
  imageAttachmentUrl: string = "";
  hasMentionAttachment: boolean = false;

  finalText: string = "";

  ngOnInit() {
    this.finalText = this.message.text;
    this.message.conversation_id = this.conversationId;
    this.handleMessageFavorites(this.message);
    this.handleMessageAttachments(this.message);
  }

  private handleMessageFavorites(message: Message) {
    if (isUndefined(message.favorited_by)) {
      message.favorited_by = [];
    }
    if (message.favorited_by.indexOf(this.myUserId) != -1) {
      this.isFavorited = true;
    }
  }

  private handleMessageAttachments(message: Message) {
    if (message.attachments.length > 0) {
      for (let i=0;i<message.attachments.length;i++) {
        let attachment = message.attachments[i];
        if (attachment.type === AttachmentType.Image) {
          this.hasImageAttachment = true;
          this.imageAttachmentUrl = attachment.url;
        } else if (attachment.type === AttachmentType.Mention) {
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

  favoriteMessage() {
    this.state.favoriteMessage(this.message.conversation_id, this.message.id).then(response => {
      this.isFavorited = response;
    });
  }

  unfavoriteMessage() {
    this.state.unfavoriteMessage(this.message.conversation_id, this.message.id).then(response => {
      this.isFavorited = !response;
    })
  }
}