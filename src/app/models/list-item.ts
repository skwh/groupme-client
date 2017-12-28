export class ListItem {
  constructor(
      public image_url: string,
      public small_text: string,
      public large_text: string,
      public is_link: boolean,
      public link_href?: any[],
      public initials?: string
  ) {}
}