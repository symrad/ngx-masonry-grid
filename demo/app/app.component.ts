import { Path } from './services/path';
import { Component, Inject } from '@angular/core';
import { Breakpoints } from '@angular/cdk/layout';
import { APP_BASE_HREF, LocationChangeListener, LocationStrategy, PathLocationStrategy } from '@angular/common';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
  animateChild
} from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [],
  animations: [
    
    trigger('flyInOut', [
      transition(':enter', [
        style({transform: 'translateX(-100%)'}),
        animate(500, style({transform: 'translateX(0)'}))
      ]),
      transition(':leave', [
        //style({transform: 'translateX(0)'}),
        animate(500, style({opacity: '0'}))
      ])
    ])
    
      /*
      state('inactive', style({
        backgroundColor: '#eee',
        transform: 'translateX(0)'
      })),
      state('active',   style({
        backgroundColor: 'white',
        transform: 'translateX(0)'
      })),
      */
     
      /*
      transition(':enter', [
        style({transform: 'translateY(-50%)'}),
        query('img', animateChild()),
        animate(500)
      ]),
      
      transition(':leave', [
        style({transform: 'translateX(100%)'}),
        query('img', animateChild()),
        animate(500)
      ]),
      */
/*
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
  */    
      
      

      /*
      transition('* => void', [
        style({transform: 'translateY(50%)'}),
        animate(500)
      ])
    
      */
    
  ]
})
export class AppComponent {
  title = 'app';
  listMasonry = [
    {src:`${this.path.getPath()}/assets/1.jpg`},
    {src:`${this.path.getPath()}/assets/2.jpg`},
    {src:`${this.path.getPath()}/assets/3.jpg`},
    {src:`${this.path.getPath()}/assets/4.jpg`},
    {src:`${this.path.getPath()}/assets/5.jpg`},
    {src:`${this.path.getPath()}/assets/6.jpg`},
    {src:`${this.path.getPath()}/assets/7.jpg`},
    {src:`${this.path.getPath()}/assets/8.jpg`},
    {src:`${this.path.getPath()}/assets/9.jpg`},
    {src:`${this.path.getPath()}/assets/10.jpg`},
    {src:`${this.path.getPath()}/assets/11.jpg`}
  ];
  queries = [{query:Breakpoints.XSmall, columns:1},{query:Breakpoints.Small, columns:2},{query:Breakpoints.Medium, columns:3},{query:Breakpoints.Large, columns:4},{query:Breakpoints.XLarge, columns:5}];
  obj =  {src:`${this.path.getPath()}/assets/3.jpg`};
  test = '';

  constructor(public path: Path){

  }
  
  aggiungi(){
    this.listMasonry.push(
      {src:`${this.path.getPath()}/assets/1.jpg`},
      {src:`${this.path.getPath()}/assets/2.jpg`}
    );
  }

  appendi(){
    this.listMasonry.unshift(
      {src:`${this.path.getPath()}/assets/7.jpg`},
      {src:`${this.path.getPath()}/assets/8.jpg`},
      {src:`${this.path.getPath()}/assets/9.jpg`}
    );
  }

  modifica(){
    this.obj.src = `${this.path.getPath()}/assets/11.jpg`;
  }

  rimuovi(){
    this.listMasonry.pop();
    //this.listMasonry.splice(3,1);
  }

  muovi(){
    var modelToMove = this.listMasonry[0];
    this.listMasonry.splice(0, 1);
    this.listMasonry.splice(this.listMasonry.length, 0, modelToMove);
  }
}
