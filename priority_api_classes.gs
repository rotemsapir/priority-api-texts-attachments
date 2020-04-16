/* Form filter */
class FilterValue {
    constructor(q) {
        this.or = 0;
        this.ignorecase = 1;
        this.QueryValues = [];
        if (q != undefined) {
            for (var i in q) {
                this.QueryValues.push(q[i]);
            }
        }
    }
}

/* Form filter items */
class QueryValue {
    constructor(field) {
        this.field = field;
        this.fromval = "";
        this.toval = "";
        this.op = "=";
        this.sort = 0;
        this.isdesc = 0;
    }
}
