import { element } from 'protractor';
import { Component, ViewContainerRef, ComponentFactoryResolver, NgZone, VERSION, ViewChild, Input, ElementRef, OnInit, EmbeddedViewRef, ComponentRef, OnChanges, SimpleChanges, ContentChild, TemplateRef, IterableDiffers, DoCheck, IterableChanges, IterableChangeRecord, DefaultIterableDiffer } from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import {
    BreakpointObserver,
    Breakpoints,
    BreakpointState
  } from '@angular/cdk/layout';
import { TemplateParseResult } from '@angular/compiler';

@Component({
  selector: 'ngx-masonry-grid',
  template: `
    <ng-container #columns>
    </ng-container>
  `,
  styles:[
      `
      :host{
        display:flex;
      }
    `
  ]
})

export class MasonryGridComponent implements OnInit, OnChanges, DoCheck {

    @ViewChild('columns', {read:ViewContainerRef}) columns:ViewContainerRef;
    @ContentChild('masonryitem', {read:TemplateRef}) masonryItem:TemplateRef<any>;

    @Input('model') model;
    /*
    set model(model: Object){
         this._model = model;
    }
    get model(): Object{
        return this._model;
    }
    
    private _model: Object;
    */

    public numberColumns = 0;
    public instanceColumns:Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems:Array<EmbeddedViewRef<any>> = [];
    private _differModel;
    private _ordinatedModel = [];
    private _isFirstChangeMediaQuery = true;

    @Input()
    public queries:Array<{query:any,columns:number}> = [];

    constructor(
        public el: ElementRef, 
        private componentFactoryResolver: ComponentFactoryResolver,
        public breakpointObserver: BreakpointObserver,
        public _differs: IterableDiffers
    ) {}

    ngOnInit() {
        for(let query of this.queries){
            this.breakpointObserver
            .observe([query.query])
            .subscribe((state: BreakpointState) => {
              if (state.matches) {
                this.numberColumns = query.columns;
                this.clearColumns();
                this.createColumns();
                if(!this._isFirstChangeMediaQuery){
                    this.populateColumns(this.instanceItems);
                }
                this._isFirstChangeMediaQuery = false;
              }
            });
        }
    }

    ngDoCheck() {
        const changes:DefaultIterableDiffer<any> = this._differModel.diff(this.model);
        if (changes) {
            let indexIteration = 0;
            let isToRecalculate = true;
            changes.forEachOperation(
                (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                    
                    if(item.previousIndex == null && indexIteration === 0 && (this.model.length-((changes['_additionsTail'].currentIndex-changes['_additionsHead'].currentIndex)+1)) === item.currentIndex){
                        //push or new instance
                        isToRecalculate = false;
                    }
                    
                    if (item.previousIndex == null) {
                        //add
                        var column = (item.currentIndex % this.numberColumns) | 0;
                        let embeddedView = this.masonryItem.createEmbeddedView(item.item);
                        embeddedView.context.$$state = 'ina';
                        this.instanceItems.splice(item.currentIndex, 0, embeddedView);
                        this._ordinatedModel.splice(item.currentIndex, 0, item.item);
                        if(!isToRecalculate){
                            var positionIntoColumn = Math.floor(item.currentIndex/this.numberColumns);
                            this.instanceColumns[column].instance.contentColumn.insert(embeddedView,positionIntoColumn);
                            embeddedView.context.$$state = 'act';
                        }
                    } else if (currentIndex == null) {
                        //remove
                        var column = (adjustedPreviousIndex % this.numberColumns) | 0;
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this.instanceColumns[column].instance.contentColumn.remove(adjustedPreviousIndex);
                        //this.instanceItems[adjustedPreviousIndex].destroy();
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        isToRecalculate = true;
                    } else {
                        //move
                        var modelToMove = this._ordinatedModel[adjustedPreviousIndex];
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(currentIndex, 0, modelToMove);

                        var instanceItemsToMove = this.instanceItems[adjustedPreviousIndex];
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this.instanceItems.splice(currentIndex, 0, instanceItemsToMove);
                        isToRecalculate = true;
                    }
                    });
                    if(isToRecalculate){
                        this.clearColumns();
                        this.createColumns();
                        this.populateColumns(this.instanceItems);
                    }
                    indexIteration++;
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
        let component = this.componentFactoryResolver.resolveComponentFactory(MasonryGridColumnComponent);
        let componentRef = this.columns.createComponent(component);
        return componentRef;
    }

    createColumns(){
        for (let i=0; i<this.numberColumns; i++){
            this.instanceColumns.push(this.createColumn());
        }
    }

    populateColumns(embeddedViews){
        for(let i in embeddedViews){
            var column = (parseInt(i) % this.numberColumns) | 0;
            this.instanceColumns[column].instance.contentColumn.insert(embeddedViews[i]);
        }
    }

    clearColumns() {
        for (let i=0; i<this.numberColumns; i++){
            if(this.instanceColumns[i]){
                var numberViewAttached:number = this.instanceColumns[i].instance.contentColumn.length;
                for (let l=0; l<numberViewAttached; l++){
                    this.instanceColumns[i].instance.contentColumn.detach(l);
                }
            }
        }

        for(let l = 0, numberColumnsToRemove = this.columns.length; l<numberColumnsToRemove; l++){
            this.columns.detach(l);
        }
        
        this.instanceColumns = [];
    }
}