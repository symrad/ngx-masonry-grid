import { Component, ViewContainerRef, ComponentFactoryResolver, NgZone, VERSION, ViewChild, Input, ElementRef } from '@angular/core';

@Component({
  selector: 'div[ngx-masonry-grid]',
  template: `<ng-container #content></ng-container>`,
  styles:[
      `
      :host{
        flex:1;
      }
    `
  ]
})
export class MasonryGridColumnComponent {
    @Input('data') data:any;
    @ViewChild('content',{read:ViewContainerRef}) contentColumn:ViewContainerRef;
    
    constructor(
      public el: ElementRef
    ) {}
}