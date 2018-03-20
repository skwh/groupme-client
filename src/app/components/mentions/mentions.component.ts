import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Member } from "../../models/member";
import { FilterPipe } from "../../pipes/filter.pipe";

@Component({
  selector:'app-mentions',
  templateUrl: 'mentions.component.html',
  styleUrls: ['mentions.component.scss']
})
export class MentionsComponent {
  @Input() groupMembers: Member[];
  @Input() searchString: string;
  @Output() foundMember = new EventEmitter<Member>();

  filteredMembers: Member[];

  ngOnChanges() {
    this.filteredMembers = (new FilterPipe()).transform(this.groupMembers, 'nickname', this.searchString);
    this.foundMember.emit(this.filteredMembers[0]);
  }

  getSelectedMember(): Member {
    return this.filteredMembers[0];
  }
}