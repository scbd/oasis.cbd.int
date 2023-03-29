export function escapeRegExp(str) { 
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); 
}

export function isRealm(realm, realmToTest, strict) {
                        
    var realmRe = strict ? new RegExp('^'+escapeRegExp(realm)+'($)')     //  MATCH realm exactly
                        : new RegExp('^'+escapeRegExp(realm)+'(\\b|$)'); //  MATCH realm with boundaries eg: ABS, ABS-*, BCH, BCH-*
    
    return realmRe.test(realmToTest);
}