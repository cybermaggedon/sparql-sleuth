
import { Observable, map } from 'rxjs';

import { Query, QueryResult } from './query';
import { QueryService } from './query.service';
import { Triple, Uri, Value } from './triple';

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

    run(q : QueryService) : Observable<QueryResult> {
	return q.query(this).pipe(
	    map(x => this.decode(x))
	);
    }

    // FIXME: Not needed?
    decode(res : QueryResult) : QueryResult {
	return res;
    }

}

