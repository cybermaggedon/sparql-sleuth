import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { Uri, Literal } from '../../rdf/triple';
import { Row } from '../../query/query';

import { GraphService } from '../../graph/graph.service';
import { DefinitionsService } from '../../query/definitions.service';

@Component({
  selector: 'datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {

    @Input() datasets : Row[] = [];

    @ViewChild('dataView') dataView : any;

    constructor(
	private graph : GraphService,
	private definitions : DefinitionsService,
    ) { }

    ngOnInit(): void {
    }

    select(id : Uri) {
	this.graph.includeNode(id as Uri);
    }

    filterby = "";

    handleKeyword(tag : string) {
	this.filterby = tag;
	this.dataView.filter(tag);
    }

}

