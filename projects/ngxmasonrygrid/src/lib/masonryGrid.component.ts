import { MasonryGridItemDirective } from './masonryGridItem.directive';
import { Component, ViewContainerRef, ComponentFactoryResolver, ViewChild, Input, ElementRef, OnInit, EmbeddedViewRef, ComponentRef, OnChanges, SimpleChanges, ContentChild, TemplateRef, IterableDiffers, DoCheck, IterableChangeRecord, DefaultIterableDiffer } from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import {
    BreakpointObserver,
    BreakpointState
  } from '@angular/cdk/layout';
import { AnimationBuilder, style, animate, AnimationFactory, AnimationPlayer, trigger, transition, query, animateChild } from '@angular/animations';
import { Observable, Observer, Subject, pipe } from 'rxjs';
import { flatMap, share, publish, concatMap, delay, tap, debounce, debounceTime } from 'rxjs/operators';

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
    @ContentChild(MasonryGridItemDirective) masonryItem:MasonryGridItemDirective;

    @Input('model') model;

    public numberColumns = 0;
    public instanceColumns:Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems:Array<EmbeddedViewRef<any>> = [];
    private _differModel;
    private _ordinatedModel = [];
    private _nativeElement = {};

    @Input()
    public queries:Array<{query:any,columns:number}> = [];

    public recalculatePosition$S:Subject<any>;
    public recalculatePosition$O:Observable<any>;
    public execution:number = 0;

    factoryAnimEnter:AnimationFactory;
    playerAnimEnter:AnimationPlayer;
    factoryAnimLeave:AnimationFactory;
    playerAnimLeave:AnimationPlayer;

    constructor(
        public el: ElementRef, 
        private componentFactoryResolver: ComponentFactoryResolver,
        public breakpointObserver: BreakpointObserver,
        public _differs: IterableDiffers,
        public _animationBuilder: AnimationBuilder,
        public element:ElementRef
    ) {
        this.recalculatePosition$S = new Subject();
        this.recalculatePosition$O = this.recalculatePosition$S.pipe(concatMap(()=>this.recalculatePosition()), share());
    }

    ngOnInit() {
        let firstIteration = true;
        this.recalculatePosition$O.subscribe((response)=>{})
        for(let query of this.queries){
            this.breakpointObserver
            .observe([query.query])
            .subscribe((state: BreakpointState) => {
              if (state.matches) {
                this.numberColumns = query.columns;
                this.recalculatePosition$S.next(this.execution++);
              }
            });
        }
    }

    ngDoCheck() {
        const changes:DefaultIterableDiffer<any> = this._differModel.diff(this.model);
        let recalculate = false;
        if (changes) {
            changes.forEachOperation(
                (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                    
                    if (item.previousIndex == null) {
                        //add
                        var column = (item.currentIndex % this.numberColumns) | 0;
                        let newItem = item.item;
                    
                        let embeddedView = this.masonryItem._template.createEmbeddedView(newItem);
                        this.instanceItems.splice(item.currentIndex, 0, embeddedView);
                        this._ordinatedModel.splice(item.currentIndex, 0, newItem);
                                          
                    } else if (currentIndex == null) {
                        //remove
                        var column = (adjustedPreviousIndex % this.numberColumns) | 0;
                        let indexToRemove = this.instanceColumns[column].instance.contentColumn.indexOf(this.instanceItems[adjustedPreviousIndex]);
                        
                        this.instanceColumns[column].instance.contentColumn.remove(indexToRemove); 
                        this.instanceItems.splice(adjustedPreviousIndex, 1);  
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);   
                        this.recalculatePosition$S.next(this.execution++);
                        
                    } else {
                        //move
                        var modelToMove = this._ordinatedModel[adjustedPreviousIndex];
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(currentIndex, 0, modelToMove);

                        var instanceItemsToMove = this.instanceItems[adjustedPreviousIndex];
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
        let component = this.componentFactoryResolver.resolveComponentFactory(MasonryGridColumnComponent);
        let componentRef = this.columns.createComponent(component);
        return componentRef;
    }

    createColumns(numberColumns){
        for (let i=0; i<numberColumns; i++){
            this.instanceColumns.push(this.createColumn());
        }
    }

    recalculatePosition(){
        return Observable.create((observer:Observer<any>)=>{
            let embeddedViews = this.instanceItems;
            let columnToAdd = this.numberColumns - this.instanceColumns.length;
            var postNumColumn;
            if(columnToAdd<-1){
                //potrebbe fare casino non ne capisco il motivo
                console.log(columnToAdd);
                //observer.next(this.instanceColumns);
                //observer.complete();
                //return;
            }
            if(columnToAdd>0){
                this.createColumns(columnToAdd);
                postNumColumn = this.instanceColumns.length;
            }else{
                postNumColumn = this.instanceColumns.length + columnToAdd;
            }
            
            for(let i in embeddedViews){
                var oldValColumn = -1;
                var newValColumn = (parseInt(i) % postNumColumn) | 0;
                var positionIntoColumn = Math.floor(parseInt(i)/postNumColumn);
                let index = -1;
                for(let l in this.instanceColumns){
                    index = this.instanceColumns[l].instance.contentColumn.indexOf(embeddedViews[i]);
                    oldValColumn = parseInt(l);
                    if(index > -1){
                        break;
                    }
                }
                
                if(index > -1 && positionIntoColumn === index && oldValColumn === newValColumn){
                    //è già nella posizione giusta
                    continue;
                }

                if(index > -1 && oldValColumn === newValColumn){
                    this.instanceColumns[newValColumn].instance.contentColumn.move(embeddedViews[i],positionIntoColumn);
                    continue;
                }
                
                if(index > -1){
                    this.instanceColumns[oldValColumn].instance.contentColumn.detach(index);
                    this.instanceColumns[newValColumn].instance.contentColumn.insert(embeddedViews[i],positionIntoColumn);
                    continue;
                }
                    
                this.instanceColumns[newValColumn].instance.contentColumn.insert(embeddedViews[i],positionIntoColumn);
                    
            }

            let columnToRemove = this.numberColumns - this.instanceColumns.length;

            if(columnToRemove < 0){
                this.instanceColumns.splice(this.columns.length+columnToRemove, Math.abs(columnToRemove));
                
                for(let l=this.columns.length-1; l >= this.numberColumns; l-- ){
                    this.columns.remove(l);
                }
            }
            observer.next(this.instanceColumns);
            observer.complete();
        }); 
    }
}