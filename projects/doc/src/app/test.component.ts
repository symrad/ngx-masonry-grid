import { Component, OnDestroy } from '@angular/core';
import { Breakpoints } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'card',
  template: `<div></div>`,
  styles: [
      `
      
      `
  ]
})
export class CardComponent implements OnDestroy{

    constructor(public http:HttpClient){
        this.http.get('');
    }

    ngOnDestroy(): void {
        console.log('destroyed');
        
    }
  
}
