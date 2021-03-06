import { MasonryGridItemDirective } from './masonryGridItem.directive';
import {
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    ContentChild,
    DefaultIterableDiffer,
    DoCheck,
    ElementRef,
    EmbeddedViewRef,
    Input,
    IterableDiffers,
    IterableChangeRecord,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewContainerRef,
    ViewChild,
    TemplateRef,
    HostBinding,
    ContentChildren,
    ViewChildren,
    HostListener,
} from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import {
    BreakpointObserver,
    BreakpointState
  } from '@angular/cdk/layout';
import {
    AnimationBuilder,
    AnimationFactory,
    AnimationPlayer
} from '@angular/animations';
import { Observable, Observer, Subject, pipe, ConnectableObservable } from 'rxjs';
import { publish, concatMap } from 'rxjs/operators';
import { NgForOfContext, NgForOf } from '@angular/common';
import { Renderer2 } from '@angular/core';

@Component({

  // tslint:disable-next-line:component-selector
  selector: 'ngx-masonry-grid',
  template: `
    <ng-container #columns>
    </ng-container>
  `,
  styles: [
      `
      :host{
          display:flex;
      }
      :host.gridSystem{
        display: grid;
        grid-gap: 0px;
        grid-template-columns: repeat(auto-fill, minmax(250px,1fr));
        grid-auto-rows: 1px;
      }
    `
  ]
})

export class MasonryGridComponent implements OnInit, OnChanges, DoCheck {

    @ViewChild('columns', {read: ViewContainerRef}) columns: ViewContainerRef;
    @ContentChild(MasonryGridItemDirective) masonryItem: MasonryGridItemDirective;
    @Input() model;

    public numberColumns = 0;
    public instanceColumns: Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems: Array<EmbeddedViewRef<any>> = [];
    private _differModel;
    private _ordinatedModel = [];

    @Input()
    public queries: Array<{query: any, columns: number}> = [];

    @Input()
    public isPolyfill: Boolean = false;

    @HostBinding('class.gridSystem') gridSystemClass: Boolean;

    public recalculatePosition$S: Subject<any>;
    public recalculatePosition$O: ConnectableObservable<any>;
    public execution = 0;

    factoryAnimEnter: AnimationFactory;
    playerAnimEnter: AnimationPlayer;
    factoryAnimLeave: AnimationFactory;
    playerAnimLeave: AnimationPlayer;

    constructor(
        public el: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        public breakpointObserver: BreakpointObserver,
        public _differs: IterableDiffers,
        public _animationBuilder: AnimationBuilder,
        public element: ElementRef,
        public _renderer: Renderer2
    ) {
        this.recalculatePosition$S = new Subject();
        this.recalculatePosition$O = this.recalculatePosition$S.pipe(
            concatMap(() => this.recalculatePosition()), publish()) as ConnectableObservable<any>;
    }

    ngOnInit() {
        this.gridSystemClass = !this.isPolyfill;
        for (const query of this.queries) {
            this.breakpointObserver
            .observe([query.query])
            .subscribe((state: BreakpointState) => {
              if (state.matches) {
                this.numberColumns = query.columns;
                if (!(this.recalculatePosition$O as any)._connection) {
                    this.recalculatePosition$O.connect();
                }
                this.recalculatePosition$S.next(this.execution++);
              }
            });
        }
    }

    ngDoCheck() {
        const changes: DefaultIterableDiffer<any> = this._differModel.diff(this.model);
        if (changes) {
            changes.forEachOperation(
                (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                    if (item.previousIndex == null) {
                        // add
                        const newItem = item.item;
                        const embeddedView = this.masonryItem._template.createEmbeddedView({$implicit: newItem});
                        this.instanceItems.splice(item.currentIndex, 0, embeddedView);
                        this._ordinatedModel.splice(item.currentIndex, 0, newItem);
                    } else if (currentIndex == null) {
                        // remove
                        if (this.isPolyfill) {
                            const column = (adjustedPreviousIndex % this.numberColumns) || 0;
                            const indexToRemove = this.instanceColumns[column].instance.contentColumn.indexOf(
                                this.instanceItems[adjustedPreviousIndex]);
                            this.instanceColumns[column].instance.contentColumn.remove(indexToRemove);
                        } else {
                            this.columns.remove(adjustedPreviousIndex);
                        }
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this.recalculatePosition$S.next(this.execution++);
                    } else {
                        // move
                        const modelToMove = this._ordinatedModel[adjustedPreviousIndex];
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(currentIndex, 0, modelToMove);

                        const instanceItemsToMove = this.instanceItems[adjustedPreviousIndex];
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this.instanceItems.splice(currentIndex, 0, instanceItemsToMove);
                    }
            });
            this.recalculatePosition$S.next(this.execution++);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('model' in changes) {
            const value = changes['model'].currentValue;
            if (!this._differModel && value) {
              this._differModel = this._differs.find(value).create(null);
            }
        }
    }

    createColumn() {
        const component = this.componentFactoryResolver.resolveComponentFactory(MasonryGridColumnComponent);
        const componentRef = this.columns.createComponent(component);
        return componentRef;
    }

    createColumns(numberColumns) {
        for (let i = 0; i < numberColumns; i++) {
            this.instanceColumns.push(this.createColumn());
        }
    }

    recalculatePosition() {
        if (this.isPolyfill) {
            return Observable.create((observer: Observer<any>) => {
                const embeddedViews = this.instanceItems;
                const columnToAdd = this.numberColumns - this.instanceColumns.length;
                let postNumColumn;
                if (columnToAdd < -1 ) {
                    // potrebbe fare casino non ne capisco il motivo
                    console.log(columnToAdd);
                    // observer.next(this.instanceColumns);
                    // observer.complete();
                    // return;
                }
                if (columnToAdd > 0) {
                    this.createColumns(columnToAdd);
                    postNumColumn = this.instanceColumns.length;
                } else {
                    postNumColumn = this.instanceColumns.length + columnToAdd;
                }

                // tslint:disable-next-line:forin
                for (const i in embeddedViews) {
                    let oldValColumn = -1;
                    const newValColumn = (parseInt(i, 10) % postNumColumn) || 0;
                    const positionIntoColumn = Math.floor(parseInt(i, 10) / postNumColumn);
                    let index = -1;
                    // tslint:disable-next-line:forin
                    for (const l in this.instanceColumns) {
                        index = this.instanceColumns[l].instance.contentColumn.indexOf(embeddedViews[i]);
                        oldValColumn = parseInt(l, 10);
                        if (index > -1) {
                            break;
                        }
                    }

                    if (index > -1 && positionIntoColumn === index && oldValColumn === newValColumn) {
                        // è già nella posizione giusta
                        continue;
                    }

                    if (index > -1 && oldValColumn === newValColumn) {
                        this.instanceColumns[newValColumn].instance.contentColumn.move(embeddedViews[i], positionIntoColumn);
                        continue;
                    }

                    if (index > -1) {
                        // in caso di problemi vedere https://github.com/angular/angular/issues/20824
                        const viewToReattach: any = this.instanceColumns[oldValColumn].instance.contentColumn.detach(index);

                        this.instanceColumns[newValColumn].instance.contentColumn.insert(viewToReattach, positionIntoColumn);
                        // problemi con l'animazione, facendo il detach il fromState dell'animazione è a void
                        // quando si rimuove un elemento il toState passa anche lui a void
                        // questo significa che si avrà una transazione void <=> void
                        // che soddisfa sia il :leave che :enter
                        // viene quindi eseguito quello che viene definito per primo
                        // vedere TransitionAnimationEngine.prototype._flushAnimations come viene popolato il queuedInstructions

                        continue;
                    }

                    this.instanceColumns[newValColumn].instance.contentColumn.insert(embeddedViews[i], positionIntoColumn);

                }

                const columnToRemove = this.numberColumns - this.instanceColumns.length;

                if (columnToRemove < 0) {
                    this.instanceColumns.splice(this.columns.length + columnToRemove, Math.abs(columnToRemove));

                    for (let l = this.columns.length - 1; l >= this.numberColumns; l-- ) {
                        this.columns.remove(l);
                    }
                }
                observer.next(this.instanceColumns);
                observer.complete();
            });
        } else {
            return Observable.create((observer: Observer<any>) => {
                const embeddedViews = this.instanceItems;

                // tslint:disable-next-line:forin
                for (const i in embeddedViews) {

                    let index = -1;
                    index = this.columns.indexOf(embeddedViews[i]);

                    if (index > -1 && index === parseInt(i, 10)) {
                        // è già nella posizione corretta
                        continue;
                    }

                    if (index > -1) {
                        this.columns.move(embeddedViews[i], parseInt(i, 10));
                        continue;
                    }

                    this.columns.insert(embeddedViews[i], parseInt(i, 10));

                }
                observer.next('');
                observer.complete();
            });
        }
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
        const rowSpan = Math.ceil((item.querySelector('img').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
        item.style.gridRowEnd = 'span ' + rowSpan;
        console.log(rowSpan);
    }

    resizeAllGridItems() {
        const allItems = document.getElementsByClassName('itemElement');
        for (let x = 0; x < allItems.length; x++) {
          this.resizeGridItem(allItems[x]);
        }
    }

    resizeInstance(instance) {
        const item = instance.elements[0];
        this.resizeGridItem(item);
    }

    /*
      window.onload = resizeAllGridItems();
      window.addEventListener("resize", resizeAllGridItems);

      allItems = document.getElementsByClassName("item");
      for(x=0;x<allItems.length;x++){
        imagesLoaded( allItems[x], resizeInstance);
      }
      */
}
