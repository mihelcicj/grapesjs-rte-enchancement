const preventDefault = e => e.preventDefault();

function extendText(editor) {
    const comps = editor.DomComponents;
    const textComponent = comps.getType('text');
    const _initialize = textComponent.view.prototype.initialize;

    comps.addType("text", {
        extend: "text",
        extendView: "text",
        isComponent(el) {
            if (el.hasAttribute("data-rte")) {
                return {
                    type: "text",
                    content: el.innerHTML,
                    components: []
                };
            }
        },
        view: {
            initialize(o) {
                _initialize.call(this, o);
                console.log('init', o.model.view);
                const el = o.model.view.el;
                const links = [...el.querySelectorAll('a')];

                el.removeEventListener('click', preventDefault);
                el.addEventListener('click', preventDefault);

                // if (o.model.view.attr['data-rte'] != null) {
                    console.log('initialize with rte', o.model.get('components'));
                    let innerHTML = o.model.get('content');
                    innerHTML += o.model.get('components').reduce((p, c) => {
                        return p += c.toHTML();
                    }, '');

                    // console.log('innerHTML', innerHTML);
                    // Prevent disable event from firing
                    this.model.set('content', innerHTML, {fromDisable: 1});
                    this.model.set('components', [], {fromDisable: 1});

                    // Prevent link clicks
                    // const el = o.model.view.el;
                    // const links = [...el.querySelectorAll('a')];

                    // el.removeEventListener('click', preventDefault);
                    // el.addEventListener('click', preventDefault);
                    // el.addEventListener('click', event => {
                    //     if (event.target.tagName === 'A') {
                    //         event.preventDefault();
                    //         // Component is not selected yet
                    //         // setTimeout(() => {
                    //         //     const comp = editor.getSelected();
                    //         //     console.log(comp.view);
                    //         //     // comp.view.enabeEditing();
                    //         // }, 0);
                    //
                    //     }
                    // });
                // }
                // const el = o.model.view.el;
                // const links = [...el.querySelectorAll('a')];
                //
                // el.addEventListener('click', event => {
                //     console.log('clicked me', event);
                //     if (event.target.tagName === 'A') {
                //         console.log('cliked an A element! GASP!');
                //         event.preventDefault();
                //         // Component is not selected yet
                //         setTimeout(() => {
                //             const comp = editor.getSelected();
                //             console.log(comp.view);
                //             // comp.view.enabeEditing();
                //         }, 0);
                //
                //     }
                // });
                //
                // console.log(o.model.view.el);
            },
            onActive(e) {
                // We place this before stopPropagation in case of nested
                // text components will not block the editing (#1394)
                if (this.rteEnabled || !this.model.get('editable')) {
                    return;
                }
                e && e.stopPropagation && e.stopPropagation();
                const rte = this.rte;

                if (rte) {
                    try {
                        this.activeRte = rte.enable(this, this.activeRte);
                    } catch (err) {
                        console.error(err);
                    }
                }

                this.rteEnabled = 1;
                this.toggleEvents(1);
            },
            disableEditing() {
                const model = this.model;
                const editable = model.get('editable');
                const rte = this.rte;
                const contentOpt = {fromDisable: 1};

                if (rte && editable) {
                    try {
                        rte.disable(this, this.activeRte);
                    } catch (err) {
                        console.error(err);
                    }

                    // Give all links "target: _blank" attribute, unless already defined
                    const links = [...this.getChildrenContainer().querySelectorAll('a')];
                    links.forEach(link => {
                        if (link.hasAttribute('target')) { return; }
                        link.setAttribute('target', '_blank');
                    });

                    const content = this.getChildrenContainer().innerHTML;
                    const comps = model.get('components');
                    comps.length && comps.reset();
                    // model.set('content', '', contentOpt);
                    model.set('content', content, contentOpt);

                    /*
                    // If there is a custom RTE the content is just baked staticly
                    // inside 'content'
                    if (true || rte.customRte) {
                        // Avoid double content by removing its children components
                        // and force to trigger change
                        model.set('content', content, contentOpt);

                        // This is a custom implementation for ckeditor5
                        // this.model.addAttributes({'data-rte': 'true'});
                        // const rteContent = this.activeRte.getData();
                        // model.set('content', rteContent, contentOpt);
                        // model.set('components', []);
                    } else {
                        const clean = model => {
                            const selectable = !['text', 'default', ''].some(type =>
                                model.is(type)
                            );
                            model.set({
                                editable: selectable && model.get('editable'),
                                highlightable: 0,
                                removable: 0,
                                draggable: 0,
                                copyable: 0,
                                selectable: selectable,
                                hoverable: selectable,
                                toolbar: ''
                            });
                            model.get('components').each(model => clean(model));
                        };

                        // Avoid re-render on reset with silent option
                        model.trigger('change:content', model, '', contentOpt);
                        comps.add(content);
                        comps.each(model => clean(model));
                        comps.trigger('resetNavigator');
                    }
                    */
                }

                this.rteEnabled = 0;
                this.toggleEvents();
            },
        }
    });
}
/*
view: {
    initialize(o) {
        _initialize.call(this, o);

        console.log('INITIALIZED!', this, o);
        if (o.model.view.attr['data-rte'] != null) {
            console.log('initialize with rte', o.model.get('components'));
            let innerHTML = o.model.get('content');
            innerHTML += o.model.get('components').reduce((p, c) => {
                return p += c.toHTML();
            }, '');

            console.log('innerHTML', innerHTML);
            // Prevent disable event from firing
            this.model.set('content', innerHTML, {fromDisable: 1});
            this.model.set('components', [], {fromDisable: 1});
        }
    },
    onActive(e) {
        console.log('Event', e);
        // We place this before stopPropagation in case of nested
        // text components will not block the editing (#1394)
        if (this.rteEnabled || !this.model.get('editable')) {
            return;
        }
        e && e.stopPropagation && e.stopPropagation();
        const rte = this.rte;

        if (rte) {
            try {
                // Since ckeditor5 returns a promise
                // add a link to "this" in order to update
                // the reference when the promise resolves
                if (this.activeRte == null) {
                    this.activeRte = {
                        parent: this,
                        onActiveEvent: e,
                        initialized: false,
                    };
                } else {
                    this.activeRte.onActiveEvent = e;
                }
                this.activeRte = rte.enable(this, this.activeRte);
            } catch (err) {
                console.error(err);
            }
        }

        this.rteEnabled = 1;
        this.toggleEvents(1);
    },
    disableEditing() {
        const model = this.model;
        const editable = model.get('editable');
        const rte = this.rte;
        const contentOpt = {fromDisable: 1};

        if (rte && editable) {
            try {
                rte.disable(this, this.activeRte);
            } catch (err) {
                console.error(err);
            }

            const content = this.getChildrenContainer().innerHTML;
            const comps = model.get('components');
            comps.length && comps.reset();
            model.set('content', '', contentOpt);

            // If there is a custom RTE the content is just baked staticly
            // inside 'content'
            if (rte.customRte) {
                // Avoid double content by removing its children components
                // and force to trigger change

                // This is a custom implementation for ckeditor5
                this.model.addAttributes({'data-rte': 'true'});
                const rteContent = this.activeRte.getData();
                model.set('content', rteContent, contentOpt);
                model.set('components', []);
            } else {
                const clean = model => {
                    const selectable = !['text', 'default', ''].some(type =>
                        model.is(type)
                    );
                    model.set({
                        editable: selectable && model.get('editable'),
                        highlightable: 0,
                        removable: 0,
                        draggable: 0,
                        copyable: 0,
                        selectable: selectable,
                        hoverable: selectable,
                        toolbar: ''
                    });
                    model.get('components').each(model => clean(model));
                };

                // Avoid re-render on reset with silent option
                model.trigger('change:content', model, '', contentOpt);
                comps.add(content);
                comps.each(model => clean(model));
                comps.trigger('resetNavigator');
            }
        }

        this.rteEnabled = 0;
        this.toggleEvents();
    },
}
*/
