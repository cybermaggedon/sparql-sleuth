
import { Component, OnInit } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
  selector: 'query-table',
  templateUrl: './query-table.component.html',
  styleUrls: ['./query-table.component.scss']
})
export class QueryTableComponent implements OnInit {

    columns : string[] = [ 's', 'p', 'o' ];

    constructor(private query : QueryService) {
    }

    ngOnInit(): void {

	// http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8
	// https://pivotlabs.vc/challenges/p#has-topic

//	let res = this.query.query("http://pivotlabs.vc/challenges/c/019f2ff9af32dfac3a0dcc473cb089ebbf26ade8", undefined, undefined);

//	let res = this.query.query(undefined, undefined, undefined);

	let res = this.query.query(undefined, "http://pivotlabs.vc/challenges/p#has-source", "http://pivotlabs.vc/challenges/s/ktnie", 3);

	console.log(res);

    }

}

