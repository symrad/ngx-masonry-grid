import { NgForOf } from '@angular/common';
import { MasonryGridComponent } from './masonryGrid.component';
import {
    Directive,
    TemplateRef,
    ViewContainerRef,
    Input,
    IterableDiffers,
    OnChanges,
    SimpleChanges,
    EmbeddedViewRef,
    DefaultIterableDiffer,
    IterableChangeRecord,
    ComponentFactoryResolver,
    DoCheck, OnInit, ComponentRef, ViewRef
} from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import { Observable, Observer, Subject, ConnectableObservable } from 'rxjs';
import { publish, concatMap } from 'rxjs/operators';
import { BreakpointState, BreakpointObserver } from '@angular/cdk/layout';
import { MasonryGridItemComponent } from './masonryGridItem.component';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[mgFor][mgForOf]'
})
export class MasonryGridItemDirective implements OnChanges, DoCheck, OnInit {

    @Input()
    mgForOf: [];

    // @HostBinding('attr.test') role = 'hhjkhk';

    public numberColumns = 0;
    public instanceColumns: Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems: Array<EmbeddedViewRef<any>> = [];
    public instanceItemsComponent: Array<ViewRef> = [];
    private _differModel;
    private _ordinatedModel = [];
    public recalculatePosition$S: Subject<any>;
    public recalculatePosition$O: ConnectableObservable<any>;

    constructor(
        public _template: TemplateRef<any>,
        public viewContainerRef: ViewContainerRef,
        public _differs: IterableDiffers,
        public masonryGrid: MasonryGridComponent,
        private componentFactoryResolver: ComponentFactoryResolver,
        public breakpointObserver: BreakpointObserver,
        ) {
        this.recalculatePosition$S = new Subject();
        this.recalculatePosition$O = this.recalculatePosition$S.pipe(
            concatMap(() => this.recalculatePosition()), publish()) as ConnectableObservable<any>;
    }

    ngOnInit() {
        for (const query of this.masonryGrid.queries) {
            this.breakpointObserver
            .observe([query.query])
            .subscribe((state: BreakpointState) => {
              if (state.matches) {
                this.numberColumns = query.columns;
                if (!(this.recalculatePosition$O as any)._connection) {
                    this.recalculatePosition$O.connect();
                }
                this.recalculatePosition$S.next(this.masonryGrid.execution++);
              }
            });
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('mgForOf' in changes) {
            const value = changes['mgForOf'].currentValue;
            if (!this._differModel && value) {
              this._differModel = this._differs.find(value).create(null);
            }
        }
    }

    ngDoCheck() {
        const changes: DefaultIterableDiffer<any> = this._differModel.diff(this.mgForOf);
        if (changes) {
            changes.forEachOperation(
                (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                    if (item.previousIndex == null) {
                        // add
                        const newItem = item.item;
                        const embeddedView = this._template.createEmbeddedView({$implicit: newItem});
                        this.instanceItems.splice(item.currentIndex, 0, embeddedView);
                        this._ordinatedModel.splice(item.currentIndex, 0, newItem);
                        if (!this.masonryGrid.isPolyfill) {
                            const instanceItemsComponent = this.createItem();
                            this.instanceItemsComponent.splice(item.currentIndex, 0, instanceItemsComponent.hostView);
                            instanceItemsComponent.instance.contentItem.insert(embeddedView);
                        }
                    } else if (currentIndex == null) {
                        // remove
                        if (this.masonryGrid.isPolyfill) {
                            const column = (adjustedPreviousIndex % this.numberColumns) || 0;
                            const indexToRemove = this.instanceColumns[column].instance.contentColumn.indexOf(
                                this.instanceItems[adjustedPreviousIndex]);
                            this.instanceColumns[column].instance.contentColumn.remove(indexToRemove);
                        } else {
                            this.viewContainerRef.remove(adjustedPreviousIndex);
                        }
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this.instanceItemsComponent.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this.recalculatePosition$S.next(this.masonryGrid.execution++);
                    } else {
                        // move
                        const modelToMove = this._ordinatedModel[adjustedPreviousIndex];
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(currentIndex, 0, modelToMove);

                        const instanceItemsToMove = this.instanceItems[adjustedPreviousIndex];
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this.instanceItems.splice(currentIndex, 0, instanceItemsToMove);

                        const instanceItemsComponentToMove = this.instanceItemsComponent[adjustedPreviousIndex];
                        this.instanceItemsComponent.splice(adjustedPreviousIndex, 1);
                        this.instanceItemsComponent.splice(currentIndex, 0, instanceItemsComponentToMove);
                    }
            });

            changes.forEachIdentityChange((record: any) => {
                const viewRef =
                this.viewContainerRef.get(record.currentIndex) as EmbeddedViewRef<any>;
                viewRef.context.$implicit = record.item;
            });

            this.recalculatePosition$S.next(this.masonryGrid.execution++);
        }
    }

    createItem(): ComponentRef<MasonryGridItemComponent> {
        const component = this.componentFactoryResolver.resolveComponentFactory(MasonryGridItemComponent);
        const componentRef = this.viewContainerRef.createComponent(component);
        return componentRef;
    }

    createColumn() {
        const component = this.componentFactoryResolver.resolveComponentFactory(MasonryGridColumnComponent);
        const componentRef = this.viewContainerRef.createComponent(component);
        return componentRef;
    }

    createColumns(numberColumns) {
        for (let i = 0; i < numberColumns; i++) {
            this.instanceColumns.push(this.createColumn());
        }
    }

    recalculatePosition() {
        if (this.masonryGrid.isPolyfill) {
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
                    this.instanceColumns.splice(this.viewContainerRef.length + columnToRemove, Math.abs(columnToRemove));

                    for (let l = this.viewContainerRef.length - 1; l >= this.numberColumns; l-- ) {
                        this.viewContainerRef.remove(l);
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
                    if (this.instanceItemsComponent[i]) {
                        index = this.viewContainerRef.indexOf(this.instanceItemsComponent[i]);
                    }

                    if (index > -1 && index === parseInt(i, 10)) {
                        // è già nella posizione corretta
                        continue;
                    }

                    if (index > -1) {
                        this.viewContainerRef.move(this.instanceItemsComponent[i], parseInt(i, 10));
                        this.masonryGrid.resizeAllGridItems();
                        continue;
                    }
                }
                this.masonryGrid.resizeAllGridItems();
                observer.next('');
                observer.complete();
            });
        }
    }
}
