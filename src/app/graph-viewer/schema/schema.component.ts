
import { Component, OnInit, Input } from '@angular/core';

import { map } from 'rxjs/operators';

import { SEE_ALSO, THUMBNAIL, LABEL, IS_A, CLASS } from '../../rdf/defs';
import { Uri } from '../../rdf/triple';
import { POQuery } from '../../query/p-o-query';
import { Row } from '../../query/query';

import { GraphService } from '../../graph/graph.service';
import { CommandService, Command } from '../../command.service';
import { DefinitionsService } from '../../query/definitions.service';

@Component({
  selector: 'schema',
  templateUrl: './schema.component.html',
  styleUrls: ['./schema.component.scss']
})
export class SchemaComponent implements OnInit {

    @Input()
    schema : Row[] = [];

    constructor(
	private graph : GraphService,
    ) { }

    ngOnInit(): void {
    }

    select(id : Uri) {
	this.graph.includeNode(id);
    }

}

