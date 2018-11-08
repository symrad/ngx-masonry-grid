import { environment } from './../../environments/environment';
import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable()
export class Path {
    constructor(public location: LocationStrategy) {}

    getPath() {
        return `${this.location.getBaseHref()}${environment.outputPath ? '/' + environment.outputPath : ''}`;
    }
}
