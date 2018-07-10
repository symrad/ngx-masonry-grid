import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MasonryGridComponent } from "./masonryGrid.component";
import { MasonryGridColumnComponent } from "./masonryGridColumn.component";
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { MasonryGridItemDirective } from "projects/ngxmasonrygrid/src/lib/masonryGridItem.directive";

@NgModule({
    declarations: [
        MasonryGridComponent,
        MasonryGridColumnComponent,
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
    entryComponents:[MasonryGridColumnComponent]
})
export class MasonryGridModule {}