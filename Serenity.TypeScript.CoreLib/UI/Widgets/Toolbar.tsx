namespace Serenity {
    export interface ToolButton {
        title?: string;
        hint?: string;
        cssClass?: string;
        icon?: string;
        onClick?: any;
        htmlEncode?: any;
        hotkey?: string;
        hotkeyAllowDefault?: boolean;
        hotkeyContext?: any;
        separator?: boolean;
        disabled?: boolean;
    }

    export interface ToolbarOptions {
        buttons?: ToolButton[];
        hotkeyContext?: any;
    }

    @Decorators.registerClass('Serenity.Toolbar')
    export class Toolbar extends Widget<ToolbarOptions> {

        constructor(div: JQuery, options: ToolbarOptions) {
            super(div, options);
            div.addClass("s-Toolbar clearfix");
            ReactDOM.render(this.render(), div[0]);
            this.setupMouseTrap();
        }

        protected mouseTrap: any;

        destroy() {
            this.element.find(Toolbar.buttonSelector).unbind('click');

            if (this.mouseTrap) {
                if (!!this.mouseTrap.destroy) {
                    this.mouseTrap.destroy();
                }
                else {
                    this.mouseTrap.reset();
                }

                this.mouseTrap = null;
            }

            super.destroy();
        }

        protected setupMouseTrap() {
            if (!window['Mousetrap'])
                return;

            var buttons;
            for (var b of this.options.buttons || []) {
                if (Q.isEmptyOrNull(b.hotkey))
                    continue;

                this.mouseTrap = this.mouseTrap || window['Mousetrap'](
                    this.options.hotkeyContext || window.document.documentElement);

                ((x) => {
                    var btn = (buttons = buttons || this.element.find(Toolbar.buttonSelector))
                        .filter("." + x.cssClass);

                    this.mouseTrap.bind(x.hotkey, function (e: BaseJQueryEventObject, action: any) {
                        if (btn.is(':visible')) {
                            btn.click();
                        }
                        return x.hotkeyAllowDefault;
                    });
                })(b);
            }
        }


        static buttonSelector = "div.tool-button";

        adjustIconClass(icon: string): string {
            if (!icon)
                return icon;

            if (Q.startsWith(icon, 'fa-'))
                return 'fa ' + icon;

            if (Q.startsWith(icon, 'glyphicon-'))
                return 'glyphicon ' + icon;

            return icon;
        }

        buttonClass(btn: ToolButton) {
            return Q.cssClass({
                "tool-button": true,
                "icon-tool-button": !!btn.icon,
                "no-text": !btn.title,
                disabled: btn.disabled,
                [btn.cssClass]: !!btn.cssClass,
            });
        }

        buttonClick(e: React.MouseEvent<any>, btn: ToolButton) {
            if (!btn.onClick || $(e.currentTarget).hasClass('disabled'))
                return;

            btn.onClick(e);
        }

        findButton(className: string): JQuery {
            if (className != null && Q.startsWith(className, '.')) {
                className = className.substr(1);
            }

            return $(Toolbar.buttonSelector + '.' + className, this.element);
        }

        render() {
            return (
                <div className="tool-buttons">
                    <div className="buttons-outer">
                        {this.renderButtons(this.props.buttons)}
                    </div>
                </div>
            );
        }

        renderButtons(buttons: ToolButton[]) {
            var result: JSX.Element[] = [];
            for (var btn of buttons) {
                if (btn.separator)
                    result.push(<div className="separator" key={result.length} />);

                result.push(this.renderButton(btn, result.length));
            }

            var key = 0;
            return (<div className="buttons-inner">
                {result.map(x => { x.key = ++key; return x; })}
                {this.props.children}
                </div>);
        }

        renderButton(btn: ToolButton, key?: any) {
            return (
                <div className={this.buttonClass(btn)} title={btn.hint}
                    onClick={(e) => this.buttonClick(e, btn)} key={key}>
                    <div className="button-outer">
                        {this.renderButtonText(btn)}
                    </div>
                </div>
            );
        }

        renderButtonText(btn: ToolButton) {
            var klass = this.adjustIconClass(btn.icon);
            if (!klass && !btn.title)
                return <span className="button-inner"></span>;
            
            if (!btn.htmlEncode) {
                var h = (klass ? '<i class="' + Q.attrEncode(klass) + '"></i> ' : '') + btn.title;
                return (<span className="button-inner" dangerouslySetInnerHTML={{ __html: h }}></span>);
            }

            if (!klass)
                return <span className="button-inner">{btn.title}</span>

            return <span className="button-inner"><i className={klass} ></i>{btn.title}</span>
        }
    }
}