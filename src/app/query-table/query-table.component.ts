
import { Component, OnInit } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
  selector: 'query-table',
  templateUrl: './query-table.component.html',
  styleUrls: ['./query-table.component.scss']
})
export class QueryTableComponent implements OnInit {

    constructor(private query : QueryService) {
    }

    ngOnInit(): void {

	let res = this.query.query(undefined, undefined, undefined);
	console.log(res);
    }

}
