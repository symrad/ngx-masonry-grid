import {
  Component,
  ViewContainerRef,
  ViewChild,
  Input,
  ElementRef
} from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'div[ngx-masonry-grid-item].ngx-masonry-grid-item',
  template: `
  <div class="ngx-masonry-grid-item-content">
    <ng-container #content></ng-container>
  </div>`,
  styles: []
})
export class MasonryGridItemComponent {
    @Input() data: any;
    @ViewChild('content', {read: ViewContainerRef}) contentItem: ViewContainerRef;
    constructor(
    ) {}
}
