
import { Component, OnInit } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
  selector: 'query-table',
  templateUrl: './query-table.component.html',
  styleUrls: ['./query-table.component.scss']
})
export class QueryTableComponent implements OnInit {

    columns : string[] = [ 's', 'p', 'o' ];

    data : string[][] = [];

    constructor(
	private query : QueryService
    ) {
    }

    ngOnInit(): void {

	this.run_query();

    }

    run_query() {

	this.query.query(
	    undefined, "http://pivotlabs.vc/challenges/p#has-topic",
	    undefined,
	    250
	).subscribe(
	    res => {

		this.data = [];
		
		for (let row of res) {
		    this.data.push([
			row.s, row.p, row.o.value
		    ]);
		}

		console.log(this.data);
	    }
	);

    }

}

