
import { Component, OnInit, Input } from '@angular/core';

import { Properties } from '../../graph/properties.service';

@Component({
    selector: 'node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent implements OnInit {

    constructor(
    ) { }

    @Input()
    properties : Properties = new Properties();

    ngOnInit(): void {

    }

}
