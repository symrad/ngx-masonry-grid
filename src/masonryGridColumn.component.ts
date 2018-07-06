import { Component, ViewContainerRef, ComponentFactoryResolver, NgZone, VERSION, ViewChild, Input, ElementRef } from '@angular/core';
import { transition, style, query, animateChild, animate, trigger, stagger } from '@angular/animations';

@Component({
  selector: 'div[ngx-masonry-grid].ngx-masonry-grid',
  template: `<ng-container #content [@queryAnimation]="contentColumn.length"></ng-container>`,
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
    queryAnimation = '';
    constructor(
      public el: ElementRef
    ) {}
}