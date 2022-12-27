
import { Query } from './query';
import { Triple, Uri, Value } from './triple';

export class TripleQuery implements Query {
    constructor(
	desc : string,
	s? : string,
	p? : string,
	o? : Uri | string,
	limit : number = 100
    ) {
	this.s = s;
	this.p = p;
	this.o = o;
	this.desc = desc;
	this.limit = limit;
    }
    s? : string;
    p? : string;
    o? : Uri | string;
    desc : string;
    limit : number = 100;
    description() { return this.desc; }
    hash() : string {
	return "tq " +  this.s + " " + this.p + " " + this.o + " " +
	    this.limit;
    }

    
    // FIXME: This is injectable
    // However, not using it against any sensitive data or stores, currently.
    getQueryString() : string {

	let query = "";

	query += "SELECT DISTINCT ?s ?p ?o WHERE {\n";
	query += "  ?s ?p ?o .\n";

	if (this.s) {
	    if (this.s.startsWith("http://") ||
		this.s.startsWith("https://"))
		query += "  FILTER(?s = <" + this.s + ">) .\n";
	    else
		query += "  FILTER(?s = \"" + this.s + "\") .\n";
	}

	if (this.p) {
	    if (this.p.startsWith("http://") ||
		this.p.startsWith("https://"))
		query += "  FILTER(?p = <" + this.p + ">) .\n";
	    else
		query += "  FILTER(?p = \"" + this.p + "\") .\n";
	}

	if (this.o) {
	    if (this.o.startsWith("http://") ||
		this.o.startsWith("https://"))
		query += "  FILTER(?o = <" + this.o + ">) .\n";
	    else
		query += "  FILTER(?o = \"" + this.o + "\") .\n";
	}

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

