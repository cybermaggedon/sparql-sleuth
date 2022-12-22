
import { Query } from './query';
import { Value, Triple } from './triple';

export class TextSearchQuery implements Query {
    constructor(
	desc : string,
	text : string,
	limit : number = 100
    ) {
	this.desc = desc;
	this.text = text;
	this.limit = limit;
    }
    desc : string;
    text : string;
    limit : number = 100;
    description() { return this.desc; }

    hash() : string {
	return "ts " +  this.text + " " + this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";

	query += "  ?s ?p ?o .\n";

	query += "  FILTER (";
	query += "    !isIRI(?o) &&";
	query += "    CONTAINS(?o, \"" + this.text + "\")";
	query += "  ) 	";

	query += "}\n";
	query += "LIMIT " + this.limit + "\n";

	query = encodeURIComponent(query);

	return "query=" + query + "&output=json";

    }

    decode(res : any) : any{
	
	let triples : Triple[] = [];
	
	for (let row of res.results.bindings) {

	    let s = row.s.value;

	    let p = row.p.value;

	    let o;

	    if (row.o.type == "uri")
		o = new Value(row.o.value, true);
	    else
		o = new Value(row.o.value, false);

	    let triple = new Triple(s, p, o);

	    triples.push(triple);

	}

	return triples;

    }

}
