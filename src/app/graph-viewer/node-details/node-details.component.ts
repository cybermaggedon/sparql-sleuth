
import { Component, OnInit, Input } from '@angular/core';

import { RelationshipService } from '../../graph/relationship.service';
import { Properties } from '../../graph/properties.service';
import { Node, Relationship } from '../../graph/graph';
import { CommandService, Direction } from '../../command.service';

@Component({
    selector: 'node-details',
    templateUrl: './node-details.component.html',
    styleUrls: ['./node-details.component.scss']
})
export class NodeDetailsComponent implements OnInit {

    constructor(
	private command : CommandService
    ) {
    }

    @Input()
    relationships : Relationship[] = [];

    @Input()
    properties : Properties = new Properties();

    @Input()
    selection? : Node;

    ngOnInit(): void {
    }

}

