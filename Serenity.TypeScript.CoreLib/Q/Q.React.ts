namespace Q {
    export function extend(obj: any, props: any) {
        for (let i in props)
            obj[i] = props[i];

        return obj;
    }

    var uniqueId = 0;

    export function withUniqueID<T>(action: (uid: (id: string) => string) => T): T {
        var prefix = "uid_" + uniqueId + "_";
        return action(function (s) {
            return prefix + s;
        });
    }

    var hasOwn = {}.hasOwnProperty;

    export function cssClass(...args: any[]): string {
        var classes = [];
        
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (!arg) continue;

            var argType = typeof arg;

            if (argType === 'string' || argType === 'number') {
                classes.push(arg);
            } else if (Array.isArray(arg) && arg.length) {
                var inner = cssClass.apply(null, arg);
                if (inner) {
                    classes.push(inner);
                }
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (hasOwn.call(arg, key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }

        return classes.join(' ');
    }
}