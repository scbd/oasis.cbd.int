export function isAdministrator(realmRoles, userRoles){
    return realmRoles.some(role => userRoles.includes(role));
}