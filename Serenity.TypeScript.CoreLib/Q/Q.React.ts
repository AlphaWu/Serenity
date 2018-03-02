namespace Q {
    export function extend(obj: any, props: any) {
        for (let i in props)
            obj[i] = props[i];

        return obj;
    }

    var uniqueId = 0;

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

    export interface WidgetComponentProps<W extends Serenity.Widget<any>> {
        id?: string | ((name: string) => string);
        name?: string;
        class?: string;
        maxLength?: number;
        required?: boolean;
        readOnly?: boolean;
        ref?: (el: W) => void;
    }

    export abstract class WidgetComponent<TWidget extends Serenity.Widget<any>, P> extends React.Component<P & WidgetComponentProps<TWidget>> {

        private widget: TWidget;
        private widgetType: (new (element: JQuery, options?: P) => TWidget);
        private tag: string;
        private attrs: any;
        private node: Element;

        constructor(widgetType: (new (element: JQuery, options?: P) => TWidget), tag: string, attrs: any, props: P) {
            super(props);
            this.widgetType = widgetType;
            this.tag = tag;
            this.attrs = Q.extend(attrs, { ref: ((el: Element) => this.node = el) });
        }

        render() {
            return React.createElement(this.tag, this.attrs);
        }

        componentDidMount() {
            var node = this.node;
            var $node = $(node);
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

            this.widget = new (this.widgetType as any)($node, props);

            if (props.maxLength != null)
                node.setAttribute("maxLength", props.maxLength.toString());

            if (props.required)
                Serenity.EditorUtils.setRequired(this.widget, true);

            if (props.readOnly)
                Serenity.EditorUtils.setReadOnly(this.widget, true);
        }

        componentWillUnmount() {
            this.widget && this.widget.destroy();
            this.widget = null;
        }

        shouldComponentUpdate() {
            return false;
        }
    }
}