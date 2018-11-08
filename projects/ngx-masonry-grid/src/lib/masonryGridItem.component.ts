import {
  Component,
  ViewContainerRef,
  ViewChild,
  Input,
  ElementRef,
  ContentChildren
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'div[ngx-masonry-grid-item].ngx-masonry-grid-item',
  template: `<div class="itemGrid" #content ></div>`,
  styles: [
      `
      :host{
        flex:1;
      }
    `
  ]
})
export class MasonryGridItemComponent {
    @Input() data: any;
    @ViewChild('content', {read: ViewContainerRef}) contentItem: ViewContainerRef;
    constructor(
      public el: ElementRef
    ) {}
}
