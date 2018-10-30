import { Directive, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[mgFor]'
})
export class MasonryGridItemDirective {

    constructor(public _template: TemplateRef<any>, public viewContainerRef: ViewContainerRef) {
    }
}
