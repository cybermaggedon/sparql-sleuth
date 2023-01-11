import { Component, OnInit, Input } from '@angular/core';

import { Uri, Literal } from '../../rdf/triple';
import { Row } from '../../query/query';

import { GraphService } from '../../graph/graph.service';
import { DefinitionsService } from '../../query/definitions.service';

interface Dataset {
    dataset : Uri;
    title : string;
    description : string;
    author : string;
    keywords : string[];
};

@Component({
  selector: 'datasets',
  templateUrl: './datasets.component.html',
  styleUrls: ['./datasets.component.scss']
})
export class DatasetsComponent implements OnInit {

    @Input() datasets : Row[] = [];

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

	this.definitions.tagQuery(new Literal(tag)).subscribe(
	    (result : any) => {
		this.graph.includeTriples(result);
	    }
	);

    }

}

