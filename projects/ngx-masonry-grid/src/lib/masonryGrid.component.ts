import { MasonryGridItemDirective } from './masonryGridItem.directive';
import {
    Component,
    ComponentFactoryResolver,
    ElementRef,
    Input,
    IterableDiffers,
    OnInit,
    HostBinding,
    ViewChildren,
    HostListener,
    QueryList,
    AfterViewInit,
    ViewChild,
} from '@angular/core';
import {
    BreakpointObserver,
  } from '@angular/cdk/layout';
import {
    AnimationBuilder
} from '@angular/animations';
import { Renderer2, TemplateRef } from '@angular/core';
import * as imagesloaded from 'imagesloaded';

@Component({

  // tslint:disable-next-line:component-selector
  selector: 'ngx-masonry-grid',
  template: `<ng-content></ng-content>`,
  styles: [
      `
      :host{
          display:flex;
      }
      :host.gridSystem{
        display: grid;
        grid-gap: 0px;
        grid-template-columns: repeat(auto-fill, minmax(250px,1fr));
        grid-auto-rows: 20px;
        /*
        Non può funzionare, chrome mette un limite di 1000 per colonne e righe!
        */
      }
    `
  ]
})

export class MasonryGridComponent implements OnInit {

    @Input()
    public queries: Array<{query: any, columns: number}> = [];

    @Input()
    public isPolyfill: Boolean = false;

    @HostBinding('class.gridSystem') gridSystemClass: Boolean;
    public execution = 0;

    constructor(
        public el: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        public breakpointObserver: BreakpointObserver,
        public _differs: IterableDiffers,
        public _animationBuilder: AnimationBuilder,
        public element: ElementRef,
        public _renderer: Renderer2
    ) {

    }

    ngOnInit() {
        this.gridSystemClass = !this.isPolyfill;
    }

    @HostListener('window:resize', ['$event'])
    onResize(ev: any) {
        this.resizeAllGridItems();
    }

    @HostListener('window:load', ['$event'])
    onLoad(ev: any) {
        this.resizeAllGridItems();
    }

    resizeGridItem(item) {
        const grid = document.getElementsByTagName('ngx-masonry-grid')[0];
        const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'), 10);
        const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'), 10);
        const rowSpan = Math.ceil(
            (item.querySelector('.ngx-masonry-grid-item-content').getBoundingClientRect().height + rowGap)
            / (rowHeight + rowGap)
        );
        item.style.gridRowEnd = 'span ' + rowSpan;
        console.log(rowSpan);
    }

    resizeAllGridItems() {
        const grid: any = document.getElementsByTagName('ngx-masonry-grid')[0];
        const allItems = document.getElementsByClassName('ngx-masonry-grid-item');
        grid.style.gridAutoRows = 'auto';
        grid.style.alignItems = 'self-start';
        for (let x = 0; x < allItems.length; x++) {
            imagesloaded( allItems[x], this.resizeInstance.bind(this));
        }
        grid.removeAttribute('style');
    }

    resizeInstance(instance) {
        const item = instance.elements[0];
        this.resizeGridItem(item);
    }
}
