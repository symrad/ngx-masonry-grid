import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppComponent } from './app.component';
import { CommonModule, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Path } from './services/path';
import { MasonryGridModule } from 'projects/ngx-masonry-grid/src/public_api';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MasonryGridModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}, Path],
  bootstrap: [AppComponent]
})
export class AppModule { }
