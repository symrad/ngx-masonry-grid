import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MasonryGridComponent } from "./masonryGrid.component";
import { MasonryGridColumnComponent } from "./masonryGridColumn.component";
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
        MasonryGridComponent,
        MasonryGridColumnComponent
    ],
    imports: [
        CommonModule,
        LayoutModule,
        HttpClientModule
    ],
    exports: [
        MasonryGridComponent
    ],
    entryComponents:[MasonryGridColumnComponent]
})
export class MasonryGridModule {}