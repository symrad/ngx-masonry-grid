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
    ComponentRef,
    EmbeddedViewRef,
    DefaultIterableDiffer,
    IterableChangeRecord
} from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import { DoCheck } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[mgFor][mgForOf]'
})
export class MasonryGridItemDirective implements OnChanges, DoCheck {

    @Input()
    mgForOf: [];
    public numberColumns = 0;
    public instanceColumns: Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems: Array<EmbeddedViewRef<any>> = [];
    private _differModel;
    private _ordinatedModel = [];

    constructor(
        public _template: TemplateRef<any>,
        public viewContainerRef: ViewContainerRef,
        public _differs: IterableDiffers,
        public masonryGrid: MasonryGridComponent
        ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('ngForOf' in changes) {
            const value = changes['ngForOf'].currentValue;
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
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this.masonryGrid.recalculatePosition$S.next(this.masonryGrid.execution++);
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
            this.masonryGrid.recalculatePosition$S.next(this.masonryGrid.execution++);
        }
    }
}
