
export type Uri = string;

export class Value {

    value : string = "";
    uri : boolean = false;

    constructor(value : string = "", is_uri : boolean = false) {
	this.value = value;
	this.uri = is_uri;
    }
    is_uri() : boolean { return this.uri; }
    is_literal() : boolean { return !this.uri; }
};

export class Triple {
    constructor(s : Uri, p : Uri, o : Value) {
	this.s = s; this.p = p; this.o = o;
    }
    s : Uri = "";
    p : Uri = "";
    o : Value = new Value();
};
