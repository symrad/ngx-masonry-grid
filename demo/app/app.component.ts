import { Component, Inject } from '@angular/core';
import { Breakpoints } from '@angular/cdk/layout';
import { APP_BASE_HREF, LocationChangeListener, LocationStrategy, PathLocationStrategy } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [{provide: LocationStrategy, useClass: PathLocationStrategy}],
  animations: [
    trigger('test', [
      state('inactive', style({
        backgroundColor: '#eee',
        transform: 'translateX(0)'
      })),
      state('active',   style({
        backgroundColor: 'white',
        transform: 'translateX(0)'
      })),
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate(1000)
      ]),
      transition('* => void', [
        style({transform: 'translateX(100%)'}),
        animate(1000)
      ])
    ])
  ]
})
export class AppComponent {
  title = 'app';
  listMasonry = [
    {src:`${this.location.getBaseHref()}/assets/1.jpg`},
    {src:`${this.location.getBaseHref()}/assets/2.jpg`},
    {src:`${this.location.getBaseHref()}/assets/3.jpg`},
    {src:`${this.location.getBaseHref()}/assets/4.jpg`},
    {src:`${this.location.getBaseHref()}/assets/5.jpg`},
    {src:`${this.location.getBaseHref()}/assets/6.jpg`},
    {src:`${this.location.getBaseHref()}/assets/7.jpg`},
    {src:`${this.location.getBaseHref()}/assets/8.jpg`},
    {src:`${this.location.getBaseHref()}/assets/9.jpg`},
    {src:`${this.location.getBaseHref()}/assets/10.jpg`},
    {src:`${this.location.getBaseHref()}/assets/11.jpg`}
  ];
  queries = [{query:Breakpoints.Small, columns:2},{query:Breakpoints.Medium, columns:3},{query:Breakpoints.Large, columns:4}];
  obj =  {src:`${this.location.getBaseHref()}/assets/3.jpg`};
  test = '';

  constructor(public location: LocationStrategy){

  }
  
  aggiungi(){
    this.listMasonry.push(
      {src:`${this.location.getBaseHref()}/assets/1.jpg`},
    {src:`${this.location.getBaseHref()}/assets/2.jpg`},
      this.obj
    );
  }

  appendi(){
    this.listMasonry.unshift(
      {src:`${this.location.getBaseHref()}/assets/7.jpg`},
      {src:`${this.location.getBaseHref()}/assets/8.jpg`},
      {src:`${this.location.getBaseHref()}/assets/9.jpg`}
    );
  }

  modifica(){
    this.obj.src = `${this.location.getBaseHref()}/assets/11.jpg`;
  }

  rimuovi(){
    this.listMasonry.shift();
  }
}
