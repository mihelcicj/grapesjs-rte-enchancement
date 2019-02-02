function extendDefaultRtePrototype(rte) {
    rte.hereIam = true;
}

function extendDefaultPrototype(editor) {
    const defaultType = editor.DomComponents.getType('default');
    defaultType.model.prototype.outermostTextParent = function() {
        let lastTextParent = null;
        let parent = this.parent && this.parent();

        while (parent != null) {
            if (parent.attributes.subtype === 'text') {
                lastTextParent = parent;
            }

            parent = parent.parent && parent.parent();
        }

        return lastTextParent;
    };

    // TODO: Move to RTE
    defaultType.view.prototype.getSelection = function() {
        if (this.el == null) { return null }
        return this.el.ownerDocument.getSelection();
    };

    defaultType.view.prototype.createRangeFromMouseEvent = function(e) {
        if (e == null || e.clientX == null || e.clientY == null || this.el == null) {
            return null;
        }

        const ownerDocument = this.el.ownerDocument;
        return ownerDocument.caretRangeFromPoint(e.clientX, e.clientY);
    };

    defaultType.view.prototype.positionCaretAtMouseEvent = function(e) {
        const selection = this.getSelection();
        const range = this.createRangeFromMouseEvent(e);

        if (selection == null || range == null) { return false; }

        selection.removeAllRanges();
        selection.addRange(range);
        return true;
    }
}

function defineText(editor) {
    const comps = editor.DomComponents;
    const textViewInitialize = comps.getType('text').view.prototype.initialize;

    comps.addType('text', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
          if (el.getAttribute && el.getAttribute('data-ch-type') === 'text') {
              return {
                  type: 'text'
              }
          }
        },
        model: {
            defaults: {
                subtype: 'text',
                hoverable: false,
                highlightable: false,
                editable: true,
                attributes: {
                    'data-ch-type': 'text'
                }
            },
        },
        view: {
            events: {
                dblclick: 'onDoubleClick'
            },
            onDoubleClick(e) {
                e.preventDefault();
                this.onActive(e);
            },
            initialize(o) {
                // console.log('init view [', o.model.get('type'), ']');
                textViewInitialize.call(this, o);
                // Clean all child components
                // Mostly removes boxes and default types
                this.model.get('components').each(model => this.clean(model));
            },
            onActive(e) {
                // We place this before stopPropagation in case of nested
                // text components will not block the editing (#1394)
                if (this.rteEnabled || !this.model.get('editable')) {
                    return;
                }

                const textParent = this.model.outermostTextParent();
                if (textParent != null) {
                    // setTimeout(() => {
                        const isAlreadyEditable =
                            textParent.view.el.getAttribute('contenteditable') === 'true';

                        editor.select(textParent);
                        textParent.view.onActive(null);

                        // If e is present, then this child is the target of onActive event
                        // If parent is already editable, there is no need to reposition caret
                        if (e != null && isAlreadyEditable === false) {
                            this.positionCaretAtMouseEvent(e);
                        }
                    // }, 0);

                    return;
                }

                e && e.stopPropagation && e.stopPropagation();
                const rte = this.rte;
                const children = this.model.get('components');

                children.forEach(child => {
                    if (child.view && child.view.el && child.attributes) {
                        if (child.attributes.subtype === 'text') {
                            child.view.el.setAttribute('contenteditable', 'true');
                        }
                    }
                });

                if (rte) {
                    try {
                        this.activeRte = rte.enable(this, this.activeRte);
                    } catch (err) {
                        console.error(err);
                    }
                }

                if (e != null) {
                    this.positionCaretAtMouseEvent(e);
                }

                this.rteEnabled = 1;
                this.toggleEvents(1);
            },

            disableEditing(options) {
                const mergedOptions = Object.assign({
                    disableRte: true
                }, options);

                const model = this.model;
                const editable = model.get('editable');
                const rte = this.rte;
                const contentOpt = { fromDisable: 1 };

                if (rte && editable) {
                    if (mergedOptions.disableRte === true) {
                        try {
                            rte.disable(this, this.activeRte);
                        } catch (err) {
                            console.error(err);
                        }
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
                        model.set('content', content, contentOpt);
                    } else {
                        // const clean = model => {
                        //     // const selectable = !['text', 'default', ''].some(type =>
                        //     //     model.is(type)
                        //     // );
                        //
                        //     model.set({
                        //         // toolbar: '',
                        //         hoverable: false,
                        //         selectable: false
                        //     });
                        //
                        //     console.log(model, model.attributes.subtype);
                        //
                        //     if (model.attributes.subtype === 'text' && model.attributes.type !== 'text') {
                        //         model.set({
                        //             hoverable: true,
                        //             selectable: true
                        //         });
                        //     }
                        //
                        //
                        //
                        //     // const selectable = !['text', 'default', ''].some(type =>
                        //     //     model.is(type)
                        //     // );
                        //     // console.log('weird', model.attributes.type);
                        //     //
                        //     // if (model.is('') || model.is('default')) {
                        //     //     model.set({
                        //     //         type: 'text',
                        //     //         subtype: 'text',
                        //     //         hoverable: false,
                        //     //         highlightable: false,
                        //     //         editable: true,
                        //     //     });
                        //     // }
                        //
                        //     model.set({
                        //         // editable: selectable && model.get('editable'),
                        //         // highlightable: 0,
                        //         // removable: 0,
                        //         // draggable: 0,
                        //         // copyable: 0,
                        //         // selectable: selectable,
                        //         // hoverable: selectable,
                        //         // toolbar: ''
                        //     });
                        //     model.get('components').each(model => clean(model));
                        // };

                        // Avoid re-render on reset with silent option
                        model.trigger('change:content', model, '', contentOpt);
                        comps.add(content);
                        comps.each(model => this.clean(model));
                        comps.trigger('resetNavigator');
                    }
                }

                this.rteEnabled = 0;
                this.toggleEvents();
            },
            clean(model) {
                // console.log('cleaning');
                // const selectable = !['text', 'default', ''].some(type =>
                //     model.is(type)
                // );

                model.set({
                    // toolbar: '',
                    hoverable: false,
                    selectable: false,
                    toolbar: '',
                    badgable: false,
                });

                // console.log(model, model.attributes.subtype);

                if (model.attributes.subtype === 'text' && model.attributes.type !== 'text') {
                    model.set({
                        hoverable: true,
                        selectable: true,
                    });
                }



                // const selectable = !['text', 'default', ''].some(type =>
                //     model.is(type)
                // );
                // console.log('weird', model.attributes.type);
                //
                // if (model.is('') || model.is('default')) {
                //     model.set({
                //         type: 'text',
                //         subtype: 'text',
                //         hoverable: false,
                //         highlightable: false,
                //         editable: true,
                //     });
                // }

                // model.set({
                    // editable: selectable && model.get('editable'),
                    // highlightable: 0,
                    // removable: 0,
                    // draggable: 0,
                    // copyable: 0,
                    // selectable: selectable,
                    // hoverable: selectable,
                    // toolbar: ''
                // });
                model.get('components').each(model => this.clean(model));
            }
        }
    });
}

function defineLink(editor) {
    const comps = editor.DomComponents;
    comps.addType('link', {
        model: {
            defaults: {
                subtype: 'text',
                name: 'Link',
                badgable: false,
                hoverable: true,
                highlightable: false,
                editable: true,
            }
        },
        view: {
            onActive: comps.getType('text').view.prototype.onActive
        }
        // view: {
        //     disableEditing() {
        //         console.log('hello link', this.el);
        //         const model = this.model;
        //         const editable = model.get('editable');
        //         const rte = this.rte;
        //         const contentOpt = { fromDisable: 1 };
        //
        //         if (rte && editable) {
        //             try {
        //                 rte.disable(this, this.activeRte);
        //             } catch (err) {
        //                 console.error(err);
        //             }
        //
        //             const content = this.getChildrenContainer().innerHTML;
        //             const comps = model.get('components');
        //             comps.length && comps.reset();
        //             model.set('content', '', contentOpt);
        //
        //             // If there is a custom RTE the content is just baked staticly
        //             // inside 'content'
        //             if (rte.customRte) {
        //                 // Avoid double content by removing its children components
        //                 // and force to trigger change
        //                 model.set('content', content, contentOpt);
        //             } else {
        //                 const clean = model => {
        //                     const selectable = !['text', 'default', ''].some(type =>
        //                         model.is(type)
        //                     );
        //                     model.set({
        //                         editable: selectable && model.get('editable'),
        //                         highlightable: 0,
        //                         removable: 0,
        //                         draggable: 0,
        //                         copyable: 0,
        //                         selectable: selectable,
        //                         hoverable: selectable,
        //                         toolbar: ''
        //                     });
        //                     model.get('components').each(model => clean(model));
        //                 };
        //
        //                 // Avoid re-render on reset with silent option
        //                 model.trigger('change:content', model, '', contentOpt);
        //                 comps.add(content);
        //                 comps.each(model => clean(model));
        //                 comps.trigger('resetNavigator');
        //             }
        //         }
        //
        //         this.rteEnabled = 0;
        //         this.toggleEvents();
        //     },
        // }
    })
}

function defineSpan(editor) {
    const comps = editor.DomComponents;
    comps.addType('span', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (['SPAN', 'B', 'I', 'U'].includes(el.tagName)) {
                return {
                    type: 'span',
                }
            }
        },
    });
}

function defineStylables(editor) {
    const comps = editor.DomComponents;
    comps.addType('stylable-span', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (['SPAN'].includes(el.tagName)
                && el.hasAttribute('data-stylable') === true) {
                console.log('span?', el);
                return {
                    type: 'stylable-span',
                }
            }
        },
        model: {
            defaults: {
                name: 'Stylable',
                subType: 'text',
                // hoverable: false,
                // selectable: false,
                // badgable: false,
                // draggable: false,
                // droppable: false,
            }
        }
    });
}

function defineParagraph(editor) {
    const comps = editor.DomComponents;
    comps.addType('paragraph', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (el.tagName === 'P') {
                console.log('p?', el);
                return {
                    type: 'paragraph',
                    subType: 'text',
                    // editable: false,
                    // hoverable: false,
                }
            }
        }
    });
}


function defineList(editor) {
    const comps = editor.DomComponents;
    comps.addType('list', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (['UL', 'OL'].includes(el.tagName)) {
                return {
                    type: 'list'
                }
            }
        }
    })
}
