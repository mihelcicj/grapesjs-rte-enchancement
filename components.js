
function extendDefaultPrototype(editor) {
    const defaultType = editor.DomComponents.getType('default');
    defaultType.model.prototype.outermostTextParent = function() {
        let lastTextParent = null;
        let parent = this.parent && this.parent();

        console.group('outermostTextParent');
        while (parent != null) {
            console.log(parent);
            if (parent.attributes.subtype === 'text') {
                lastTextParent = parent;
            }

            parent = parent.parent && parent.parent();
        }
        console.groupEnd();

        return lastTextParent;
    };
}

function mergeTextTypes(editor) {
    const comps = editor.DomComponents;
    comps.addType('mergedTexts', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (['A', 'P', 'SPAN', 'UL', 'OL'].includes(el.tagName)) {
                return {
                    type: 'text',
                    // name: el.tagName,
                    content: el.innerHTML,
                    components: []
                }
            }
        },
    });
}

// function defineDefault(editor) {
//     const comps = editor.DomComponents;
//     comps.addType('default', {
//         extend: 'default',
//         extendView: 'default',
//         isComponent(el) {
//
//         }
//     });
// }

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
            // myMethod() {
            //   console.log('hello');
            // }
        },
        view: {
            events: {
                dblclick: 'onDoubleClick'
            },
            // events: {
            //     // 'click': 'handleClick'
            // },
            // handleClick(e) {
            //     // console.log('sel', editor.getSelected());
            //     // console.log(this, e);
            //     this.onActive(e);
            // },

            onDoubleClick(e) {
                console.log(e);
                console.log('ondblclick', this);
                e.preventDefault();

                this.onActive(e);
            },
            initialize(o) {
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
                    console.log('textparent found', textParent);
                    setTimeout(() => {
                        editor.select(textParent);
                        textParent.view.onActive(null);
                    }, 0);

                    return;
                }

                e && e.stopPropagation && e.stopPropagation();
                const rte = this.rte;
                const children = this.model.get('components');
                children.forEach(child => {
                    console.log(child);
                    if (child.view && child.view.el && child.attributes) {
                        if (child.attributes.subtype === 'text') {
                            child.view.el.setAttribute('contenteditable', 'true');
                        }
                    }
                });

                if (rte) {
                    try {
                        this.activeRte = rte.enable(this, this.activeRte);
                        // this.activeRte.selection().collapseToEnd();
                    } catch (err) {
                        console.error(err);
                    }
                }
                //
                // console.log(this.activeRte.selection());
                // console.log(this.activeRte.doc);
                // {
                //
                // }
                //
                // // Consolidate range into caret
                // const selection = this.activeRte.selection();
                // const doc = this.activeRte.doc;
                //

                this.rteEnabled = 1;
                this.toggleEvents(1);
            },
            disableEditing() {
                console.log('hello', this.el);
                const model = this.model;
                const editable = model.get('editable');
                const rte = this.rte;
                const contentOpt = { fromDisable: 1 };

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
                console.log('cleaning');
                // const selectable = !['text', 'default', ''].some(type =>
                //     model.is(type)
                // );

                model.set({
                    // toolbar: '',
                    hoverable: false,
                    selectable: false
                });

                console.log(model, model.attributes.subtype);

                if (model.attributes.subtype === 'text' && model.attributes.type !== 'text') {
                    model.set({
                        hoverable: true,
                        selectable: true
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
