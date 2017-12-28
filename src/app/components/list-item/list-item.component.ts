import { Component, Input } from "@angular/core";
import { ListItem } from "../../models/list-item";

@Component({
  selector: 'app-list-item',
  templateUrl: 'list-item.component.html',
  styleUrls: ['list-item.component.scss']
})
export class ListItemComponent {
  @Input() itemDetails: ListItem;
}