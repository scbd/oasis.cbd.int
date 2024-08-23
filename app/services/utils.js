export function escapeRegExp(str) { 
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); 
}

export function isRealm(realm, realmToTest, strict) {
                        
    var realmRe = strict ? new RegExp('^'+escapeRegExp(realm)+'($)')     //  MATCH realm exactly
                        : new RegExp('^'+escapeRegExp(realm)+'(\\b|$)'); //  MATCH realm with boundaries eg: ABS, ABS-*, BCH, BCH-*
    
    return realmRe.test(realmToTest);
}


export function escape(value) {

    if(value===undefined) return;
    if(value===null)      return;
    if(value==="")        return;

    if(_.isNumber(value)) value = value.toString();
    if(_.isDate  (value)) value = value.toISOString();

    //TODO add more types

    value = value.toString();

    value = value.replace(/\\/g,   '\\\\');
    value = value.replace(/\+/g,   '\\+');
    value = value.replace(/\-/g,   '\\-');
    value = value.replace(/\&\&/g, '\\&&');
    value = value.replace(/\|\|/g, '\\||');
    value = value.replace(/\!/g,   '\\!');
    value = value.replace(/\(/g,   '\\(');
    value = value.replace(/\)/g,   '\\)');
    value = value.replace(/\{/g,   '\\{');
    value = value.replace(/\}/g,   '\\}');
    value = value.replace(/\[/g,   '\\[');
    value = value.replace(/\]/g,   '\\]');
    value = value.replace(/\^/g,   '\\^');
    value = value.replace(/\"/g,   '\\"');
    value = value.replace(/\~/g,   '\\~');
    value = value.replace(/\*/g,   '\\*');
    value = value.replace(/\?/g,   '\\?');
    value = value.replace(/\:/g,   '\\:');

    return value;
}

export function andOr(query, sep) {

    sep = sep || 'AND';

    if(Array.isArray(query)) {

        query = query.map(function(criteria){

            if(Array.isArray(criteria)) {
                return andOr(criteria, sep=="AND" ? "OR" : "AND");
            }

            return criteria;
        });

        query = '(' + query.join(' ' + sep + ' ') + ')';
    }

    return query;
}

export function localizeFields (field, locale){
    return field.replace(/_EN_/ig, `_${locale.toUpperCase()}_`);
}