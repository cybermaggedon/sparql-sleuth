
import { Observable } from 'rxjs';

import { Query, QueryResult } from './query';
import { QueryService } from './query.service';
import { Triple, Uri, Value } from './triple';

export class TripleQuery implements Query {
    constructor(
	desc : string,
	s? : Value,
	p? : Value,
	o? : Value,
	limit : number = 100
    ) {
	this.s = s;
	this.p = p;
	this.o = o;
	this.desc = desc;
	this.limit = limit;
    }
    s? : Value;
    p? : Value;
    o? : Value;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "tq " +
	    (this.s ? this.s.hash() : "-") + " " +
	    (this.p ? this.p.hash() : "-") + " " +
	    (this.o ? this.o.hash() : "-") + " " +
	    this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";
	query += "  ?s ?p ?o .\n";

	if (this.s) {
	    query += "  FILTER(?s = " + this.s.term() + ") .\n";
	}

	if (this.p) {
	    query += "  FILTER(?p = " + this.p.term() + ") .\n";
	}

	if (this.o) {
	    query += "  FILTER(?o = " + this.o.term() + ") .\n";
	}

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);
	return "query=" + query + "&output=json";

    };

    run(q : QueryService) : Observable<QueryResult> {
	return q.query(this);
    }

    decode(res : QueryResult) : any {

	return res;

    }

}

