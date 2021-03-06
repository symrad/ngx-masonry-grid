import {
  Component,
  ViewContainerRef,
  ViewChild,
  Input,
  ElementRef
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'div[ngx-masonry-grid-column].ngx-masonry-grid-column',
  template: `<ng-container #content ></ng-container>`,
  styles: [
      `
      :host{
        flex:1;
      }
    `
  ]
})
export class MasonryGridColumnComponent {
    @Input() data: any;
    @ViewChild('content', {read: ViewContainerRef}) contentColumn: ViewContainerRef;
    constructor(
      public el: ElementRef
    ) {}
}
