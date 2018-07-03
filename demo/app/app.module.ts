import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MasonryGridModule } from 'src/masonryGrid.module';
import { CardComponent } from './test.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Path } from './services/path';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent
  ],
  imports: [
    BrowserModule,
    MasonryGridModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy},Path],
  bootstrap: [AppComponent]
})
export class AppModule { }
