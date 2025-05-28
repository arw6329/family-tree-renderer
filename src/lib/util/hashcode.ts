// https://stackoverflow.com/questions/194846/is-there-hash-code-function-accepting-any-object-type

export function hashCode(string: string){
    var hash = 0;
    for (var i = 0; i < string.length; i++) {
        var code = string.charCodeAt(i);
        hash = ((hash<<5)-hash)+code;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}