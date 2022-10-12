
import { Component, OnInit } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
    selector: 'query-graph',
    templateUrl: './query-graph.component.html',
    styleUrls: ['./query-graph.component.scss']
})
export class QueryGraphComponent implements OnInit {

    data : string[][] = [];

    constructor(
	private query : QueryService
    ) { }

    ngOnInit(): void {
    }

    run_query() {

	// http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8
	// https://pivotlabs.vc/challenges/p#has-topic

	//	let res = this.query.query("http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8", undefined, undefined);

	//	let res = this.query.query(undefined, undefined, undefined);

	/*
	  let res = this.query.query(
	  undefined, "http://pivotlabs.vc/challenges/p#has-source",
	  "http://pivotlabs.vc/challenges/s/ktn",
	  25
	  );
	*/

	let res = this.query.query(
	    undefined, "http://pivotlabs.vc/challenges/p#has-topic",
	    undefined,
	    250
	);

	this.data = [];

	for (let row of res) {
	    this.data.push([
		row.s, row.p, row.o.value
	    ]);
	}

	console.log(res);

    }

}
