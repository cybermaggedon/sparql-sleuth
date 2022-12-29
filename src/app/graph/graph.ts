
import { Uri } from '../query/triple';

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
    id : Uri = new Uri("");
    inward : boolean = false;
};
