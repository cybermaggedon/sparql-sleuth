
export class Node {
    id : string = "";
    label : string | null = null;
};

export class Edge {
    id : string = "";
    label : string | null = null;
    from : string = "";
    to : string = "";
};

export class Relationship {
    name : string = "";
    id : string = "";
    inward : boolean = false;
};
