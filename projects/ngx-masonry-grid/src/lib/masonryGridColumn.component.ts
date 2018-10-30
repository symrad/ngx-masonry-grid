import { Component, ViewContainerRef, ComponentFactoryResolver, NgZone, VERSION, ViewChild, Input, ElementRef } from '@angular/core';
import { transition, style, query, animateChild, animate, trigger, stagger } from '@angular/animations';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'div[ngx-masonry-grid].ngx-masonry-grid',
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
