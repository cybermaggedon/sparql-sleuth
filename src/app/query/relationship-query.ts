
import { Observable, map } from 'rxjs';

import { Query, QueryResult, QueryEngine } from './query';
import { Value } from '../rdf/triple';

export class RelationshipQuery implements Query {
    constructor(
	desc : string,
	id : Value,
	inward : boolean,
	limit : number = 100
    ) {
	this.id = id;
	this.inward = inward;
	this.desc = desc;
	this.limit = limit;
    }
    id : Value;
    inward : boolean;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "eq " +  this.id.hash() + " " + this.inward + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?pred WHERE {\n";

	if (this.inward)
	    query += "  ?s ?pred " + this.id.term() + " . \n";
	else {
	    query += "  " + this.id.term() + " ?pred ?o . \n";
	    
	    // Only want links to URIs, not literals.
	    // FIXME, filter out thumbnails and references?
	    query += "  FILTER(isIRI(?o)) .\n";
	}

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    run(q : QueryEngine) : Observable<QueryResult> {
	return q.query(this).pipe(
	    map(x => this.decode(x))
	);
    }

    decode(res : QueryResult) : QueryResult {
        return res;
/*
	let values : Value[] = [];

	for (let row of res.data) {
	    let pred = row["pred"];
	    values.push(pred);
	}

	return values;
	*/
    }
	
}

