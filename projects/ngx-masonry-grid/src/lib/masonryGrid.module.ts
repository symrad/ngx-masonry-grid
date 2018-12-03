import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasonryGridComponent } from './masonryGrid.component';
import { MasonryGridColumnComponent } from './masonryGridColumn.component';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { MasonryGridItemDirective } from './masonryGridItem.directive';
import { MasonryGridItemComponent } from './masonryGridItem.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

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
        HttpClientModule,
        NoopAnimationsModule
    ],
    exports: [
        MasonryGridComponent,
        MasonryGridColumnComponent,
        MasonryGridItemDirective
    ],
    entryComponents: [MasonryGridColumnComponent, MasonryGridItemComponent],
    schemas: [ NO_ERRORS_SCHEMA ]
})
export class MasonryGridModule {}
