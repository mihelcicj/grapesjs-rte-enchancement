function extendText(editor) {
    const comps = editor.DomComponents;
    const textComponent = comps.getType('text');
    const _initialize = textComponent.view.prototype.initialize;

    comps.addType('text', {
        extend: 'text',
        extendView: 'text',
        isComponent(el) {
            if (el.hasAttribute('data-rte')) {
                return {
                    type: 'text',
                    content: el.innerHTML,
                    components: []
                };
            }
        },
        model: {
            defaults: {
                name: 'Paragraph',
                // toolbar: defaultToolbar,
                hoverable: false,
                highlightable: false,
                // stylable: typographySector.concat(backgroundSector).concat(borderSector).concat(shadowSector).concat(layoutAndSizeSector)
            }
        },
        view: {
            initialize(o) {
                _initialize.call(this, o);
                const el = o.model.view.el;

                el.removeEventListener('click', e => e.preventDefault());
                el.addEventListener('click', e => e.preventDefault());

                let innerHTML = o.model.get('content');
                innerHTML += o.model.get('components').reduce((p, c) => {
                    return p += c.toHTML();
                }, '');

                // Prevent disable event from firing
                this.model.set('content', innerHTML, {fromDisable: 1});
                this.model.set('components', [], {fromDisable: 1});
            },
            disableEditing() {
                const model = this.model;
                const editable = model.get('editable');
                const rte = this.rte;
                const contentOpt = {fromDisable: 1};

                if (rte && editable) {
                    try {
                        rte.disable(this, this.activeRte);
                        rte.actionbar.parentNode.classList.remove('show-link-editor');
                    } catch (err) {
                        console.error(err);
                    }

                    // Give all links "target: _blank" attribute, unless already defined
                    const links = [].slice.call(this.getChildrenContainer().querySelectorAll('a'));
                    links.forEach(link => {
                        if (link.hasAttribute('target')) { return; }
                        link.setAttribute('target', '_blank');
                    });

                    const content = this.getChildrenContainer().innerHTML;
                    const comps = model.get('components');
                    comps.length && comps.reset();

                    // Marks component as being owned by rte
                    model.addAttributes({'data-rte': 'true'});
                    model.set('content', content, contentOpt);
                }

                this.rteEnabled = 0;
                this.toggleEvents();
            },
        }
    });
}
