
import { Observable, map } from 'rxjs';

import { Query, QueryResult, QueryEngine } from './query';
import { Triple, Uri, Value } from '../rdf/triple';

export class RawQuery implements Query {
    constructor(
	desc : string,
	qry : string,
    ) {
	this.qry = qry;
	this.desc = desc;
    }
    desc : string;
    qry : string;
    description() { return this.desc; }
    hash() : string {
	return "rq " +  this.qry;
    }
    
    getQueryString() : string {

	let query = this.qry;

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    run(q : QueryEngine) : Observable<QueryResult> {
	return q.query(this);
    }

}

