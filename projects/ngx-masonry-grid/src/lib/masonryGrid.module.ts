import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasonryGridComponent } from './masonryGrid.component';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { MasonryGridItemDirective } from './masonryGridItem.directive';
import { MasonryGridItemComponent } from './masonryGridItem.component';

@NgModule({
    declarations: [
        MasonryGridComponent,
        MasonryGridColumnComponent,
        MasonryGridItemComponent,
        MasonryGridItemDirective
    ],
    imports: [
        CommonModule,
        LayoutModule,
        HttpClientModule
    ],
    exports: [
        MasonryGridComponent,
        MasonryGridColumnComponent,
        MasonryGridItemDirective
    ],
    entryComponents: [MasonryGridColumnComponent, MasonryGridItemComponent]
})
export class MasonryGridModule {}
