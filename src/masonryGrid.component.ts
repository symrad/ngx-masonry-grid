import { Component, ViewContainerRef, ComponentFactoryResolver, ViewChild, Input, ElementRef, OnInit, EmbeddedViewRef, ComponentRef, OnChanges, SimpleChanges, ContentChild, TemplateRef, IterableDiffers, DoCheck, IterableChangeRecord, DefaultIterableDiffer } from '@angular/core';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import {
    BreakpointObserver,
    BreakpointState
  } from '@angular/cdk/layout';
import { AnimationBuilder, style, animate, AnimationFactory, AnimationPlayer } from '@angular/animations';

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

    public numberColumns = 0;
    public instanceColumns:Array<ComponentRef<MasonryGridColumnComponent>> = [];
    public instanceItems:Array<EmbeddedViewRef<any>> = [];
    private _differModel;
    private _ordinatedModel = [];
    private _nativeElement = {};

    @Input()
    public queries:Array<{query:any,columns:number}> = [];

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
        this.factoryAnimEnter = this._animationBuilder.build([
            style({transform: 'translateY(-50%)'}),
            animate(500)
          ]);

        this.factoryAnimLeave = this._animationBuilder.build([
            style({transform: 'translateX(0)'}),
            animate(500,style({transform: 'translateX(100%)'}))
        ]);
    }

    ngOnInit() {
        for(let query of this.queries){
            this.breakpointObserver
            .observe([query.query])
            .subscribe((state: BreakpointState) => {
              if (state.matches) {
                this.numberColumns = query.columns;
                this.recalculatePosition(this.instanceItems);
              }
            });
        }
    }

    ngDoCheck() {
        const changes:DefaultIterableDiffer<any> = this._differModel.diff(this.model);
        if (changes) {
            changes.forEachOperation(
                (item: IterableChangeRecord<any>, adjustedPreviousIndex: number, currentIndex: number) => {
                    
                    if (item.previousIndex == null) {
                        //add
                        var column = (item.currentIndex % this.numberColumns) | 0;
                        let embeddedView = this.masonryItem.createEmbeddedView(item.item);
                        
                        this.instanceItems.splice(item.currentIndex, 0, embeddedView);
                        this._ordinatedModel.splice(item.currentIndex, 0, item.item);
                       
                        var positionIntoColumn = Math.floor(item.currentIndex/this.numberColumns);
                        let viewRef = this.instanceColumns[column].instance.contentColumn.insert(embeddedView,positionIntoColumn);

                        this.recalculatePositionNativeElement();
                        let nativeElement = this._nativeElement[column][positionIntoColumn];
                        
                        this.playerAnimEnter = this.factoryAnimEnter.create(nativeElement, {});
                        this.playerAnimEnter.play();
                        this.recalculatePosition(this.instanceItems);

                    } else if (currentIndex == null) {
                        //remove
                        
                            var column = (adjustedPreviousIndex % this.numberColumns) | 0;
                            let indexToRemove = this.instanceColumns[column].instance.contentColumn.indexOf(this.instanceItems[adjustedPreviousIndex]);
                            
                            let nativeElement = this._nativeElement[column][indexToRemove];
                            this.playerAnimLeave = this.factoryAnimLeave.create(nativeElement, {});
                            this.playerAnimLeave.play();
                            
                            this.instanceColumns[column].instance.contentColumn.remove(indexToRemove); 
                            this.instanceItems.splice(adjustedPreviousIndex, 1);  
                            this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                            this.recalculatePositionNativeElement();

                            this.recalculatePosition(this.instanceItems);
                            
                    } else {
                        //move
                        var modelToMove = this._ordinatedModel[adjustedPreviousIndex];
                        this._ordinatedModel.splice(adjustedPreviousIndex, 1);
                        this._ordinatedModel.splice(currentIndex, 0, modelToMove);

                        var instanceItemsToMove = this.instanceItems[adjustedPreviousIndex];
                        this.instanceItems.splice(adjustedPreviousIndex, 1);
                        this.instanceItems.splice(currentIndex, 0, instanceItemsToMove);
                        this.recalculatePosition(this.instanceItems);
                    }
                    });
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

    recalculatePosition(embeddedViews){

        let columnToAdd = this.numberColumns - this.columns.length;
        var prevNumColumn = this.columns.length;
        var postNumColumn;
        if(columnToAdd>0){
            this.createColumns(columnToAdd);
            postNumColumn = this.columns.length;
        }else{
            postNumColumn = this.columns.length + columnToAdd;
        }
        

        for(let i in embeddedViews){
            var oldValColumn = (parseInt(i) % prevNumColumn) | 0;
            var newValColumn = (parseInt(i) % postNumColumn) | 0;
            var positionIntoColumn = Math.floor(parseInt(i)/postNumColumn);
            let index = this.instanceColumns[oldValColumn].instance.contentColumn.indexOf(embeddedViews[i]);
            if(index > -1 && positionIntoColumn === index && oldValColumn === newValColumn){
                //è già nella posizione giusta
                continue;
            }
               
            if(index > -1){
                this.instanceColumns[oldValColumn].instance.contentColumn.detach(index);
                this.instanceColumns[newValColumn].instance.contentColumn.insert(embeddedViews[i],positionIntoColumn);
                continue;
            }
                
            this.instanceColumns[newValColumn].instance.contentColumn.insert(embeddedViews[i],positionIntoColumn);
                
        }

        let columnToRemove = this.numberColumns - this.columns.length;

        if(columnToRemove < 0){
            this.instanceColumns.splice(this.columns.length-1, Math.abs(columnToRemove));
            for(let l=this.columns.length; l > this.numberColumns; l-- ){
                this.columns.remove(l);
            }
        }
    }

    recalculatePositionNativeElement(){
        var columnElement = this.element.nativeElement.getElementsByClassName('ngx-masonry-grid');

        for(let l=0; l<columnElement.length;l++){
            this.element.nativeElement
            this._nativeElement[l] = columnElement[l].getElementsByClassName('itemElement');
        }
    }
}