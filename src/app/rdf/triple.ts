
export interface Value {
    value() : string;
    is_uri() : boolean;
    is_literal() : boolean;
    is_unbound() : boolean;
    datatype() : string | null;
    hash() : string;
    term() : string;
};

export class Literal implements Value {
    constructor(value : string, datatype : string | null = null) {
	this.val = value;
	this.dt = datatype;
    }
    value() { return this.val; }
    datatype() { return this.dt; }
    dt : string | null = null;
    is_uri() { return false; }
    is_literal() { return true; }
    is_unbound() { return false; }
    val : string = "";
    hash() {
	let h = "l//" + this.val;
	if (this.dt) h += "//" + this.dt;
	return h;
    }
    term() {
	if (this.dt)
	    return '"' + this.val + '"^^' + this.dt;
	else
	    return '"' + this.val + '"';
    }
};

export class Uri implements Value {
    constructor(uri : string) {
	this.uri = uri;
    }
    value() { return this.uri; }
    datatype() { return null; }
    uri : string = "";
    is_uri() { return true; }
    is_literal() { return false; }
    is_unbound() { return false; }
    hash() {
	return "u//" + this.uri;
    }
    term() {
	return '<' + this.uri + '>';
    }
};

export class Unbound implements Value {
    constructor() {
    }
    value() { return ""; }
    datatype() { return null; }
    is_uri() { return false; }
    is_literal() { return false; }
    is_unbound() { return true; }
    hash() { return "n"; }
    term() {
        console.log("FIXME: Caan't put Unbound in a SPARQL query");
	return '""';
//	throw new Error("Can't put Unbound in a SPARQL query");
//	return "FIXME";
    }
};

export class Triple {
    constructor(s : Value, p : Value, o : Value) {
	this.s = s; this.p = p; this.o = o;
    }
    s : Value = new Unbound();
    p : Value = new Unbound();
    o : Value = new Unbound();
};

