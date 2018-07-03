import { Component } from '@angular/core';
import { Breakpoints } from '@angular/cdk/layout';
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
    {src:'../assets/1.jpg'},
    {src:'../assets/2.jpg'},
    {src:'../assets/3.jpg'},
    {src:'../assets/4.jpg'},
    {src:'../assets/5.jpg'},
    {src:'../assets/6.jpg'},
    {src:'../assets/7.jpg'},
    {src:'../assets/8.jpg'},
    {src:'../assets/9.jpg'},
    {src:'../assets/10.jpg'},
    {src:'../assets/11.jpg'}
  ];
  queries = [{query:Breakpoints.Small, columns:2},{query:Breakpoints.Medium, columns:3},{query:Breakpoints.Large, columns:4}];
  obj =  {src:'../assets/3.jpg'};
  test = '';
  
  aggiungi(){
    this.listMasonry.push(
      {src:'../assets/1.jpg'},
      {src:'../assets/2.jpg'},
      this.obj
    );
  }

  appendi(){
    this.listMasonry.unshift(
      {src:'../assets/7.jpg'},
      {src:'../assets/8.jpg'},
      {src:'../assets/9.jpg'}
    );
  }

  modifica(){
    this.obj.src = '../assets/11.jpg';
  }

  rimuovi(){
    this.listMasonry.shift();
  }
}
