namespace Q {
    export function extend(obj: any, props: any) {
        for (let i in props)
            obj[i] = props[i];

        return obj;
    }

    var uniqueId = 0;

    export function uniqueX2(): () => (() => string) {
        var prefix = "uid_" + (++uniqueId) + "_";
        return function () {
            var counter = 0;
            var flag = false;
            return function () {
                flag = !flag;
                return prefix + (flag ? (++counter) : (counter));
            }
        }
    }

    export function uniqueID(): ((id: string) => string) {
        var prefix = "uid_" + (++uniqueId) + "_";
        return function (id) {
            return prefix + id;
        }
    }

    export function withUniqueID<T>(action: (uid: (id: string) => string) => T): T {
        var prefix = "uid_" + (++uniqueId) + "_";
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

    if (typeof React === "undefined" &&
        window['preact'] != null) {
        window['React'] = window['ReactDOM'] = window['preact'];
    }

    function widgetComponentFactory(widgetType: any) {

        return (function (_super) {
            __extends(Wrapper, _super);

            function Wrapper() {
                return _super !== null && _super.apply(this, arguments) || this;
            }

            Wrapper.prototype.render = function () {
                return React.createElement("div", {
                    ref: ((el: any) => this.el = el),
                    className: 'widget-wrapper'
                });
            };

            Wrapper.prototype.componentDidMount = function () {

                if (this.widget != null)
                    return;

                var $node = Serenity.Widget.elementFor(widgetType);
                var node = $node[0];
                this.el.appendChild(node);

                var props = this.props;

                if (props.id != null) {
                    if (typeof props.id === "function") {
                        if (props.name)
                            node.id = (props.id as any)(props.name as string);
                    }
                    else
                        node.id = props.id as string;
                }

                if (props.name != null)
                    (node as any).name = props.name;

                if ($node.is(':input'))
                    $node.addClass("editor");

                if (props.class != null)
                    $node.addClass(props.class);

                this.widget = new (widgetType as any)($node, props);

                if (props.maxLength != null)
                    node.setAttribute("maxLength", props.maxLength.toString());

                if (props.required)
                    Serenity.EditorUtils.setRequired(this.widget, true);

                if (props.readOnly)
                    Serenity.EditorUtils.setReadOnly(this.widget, true);
            }

            Wrapper.prototype.componentWillUnmount = function () {
                this.widget && this.widget.destroy();
                this.widget = null;
            };

            Wrapper.prototype.shouldComponentUpdate = function () {
                return false;
            };

            (Wrapper as any).displayName = "Wrapped<" + (ss as any).getTypeFullName(widgetType) + ">";

            return Wrapper;
        }(React.Component));
    }

    var reactCreateElement = React.createElement;
    (React as any).createElement = function () {
        var arg = arguments[0];
        if (typeof arg === "function" && arg.__isWidgetType === true) {
            if (arg.__componentFactory === undefined)
                arguments[0] = arg.__componentFactory = widgetComponentFactory(arg);
            else
                arguments[0] = arg.__componentFactory;
        }

        return reactCreateElement.apply(this, arguments);
    };
}