import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[mgItem]'
})
export class MasonryGridItemDirective {

    constructor(public _template:TemplateRef<any>, public viewContainerRef:ViewContainerRef){
        
    }
}
