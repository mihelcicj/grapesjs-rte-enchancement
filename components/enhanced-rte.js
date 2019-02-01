
function extendRichTextEditor(editor) {
    const rte = editor.RichTextEditor;

    ['bold', 'italic', 'strikethrough', 'underline', 'link'].forEach(i => rte.remove(i));
    ['Bold', 'Italic', 'Underline'].forEach(opt => {
        const lowerCaseOpt = opt.toLowerCase();
        rte.add(lowerCaseOpt, {
            icon: `<span class="fa fa-${lowerCaseOpt}"></span>`,
            attributes: {title: opt},
            result: rt => rt.exec(lowerCaseOpt)
        });
    });
    rte.add('ordered-list', {
        icon: `<span class="fa fa-list-ol"></span>`,
        attributes: {
            title: 'OL'
        },
        result: rte => {
            rte.exec('insertOrderedList');
            editor.getSelected().view.el.focus();
        }
    });

    rte.add('ordered-list', {
        icon: `<span class="fa fa-list-ul"></span>`,
        attributes: {
            title: 'UL'
        },
        result: rte => {
            rte.exec('insertUnorderedList');
            editor.getSelected().view.el.focus();
        }
    });

    rte.add('link', {
        icon: `
            <div>
             <span class="fa fa-link"></span>
             <div class="link-active-indicator"></div>
            </div>
        `.trim(),
        attributes: {
            title: 'Link',
            id: 'rte-link'
        },
        result: (rte, action) => {
            if (action.btn.classList.contains('disabled')) {
                return;
            }
            action.btn.parentNode.parentNode.classList.toggle('show-link-editor');
        },
        update: (rte, action) => {
            const selection = rte.selection();
            const anchorNode = selection.anchorNode;
            const onlyNode = anchorNode === selection.extentNode;

            // Selection is not updated until next tick
            setTimeout(() => {
                action.btn.classList.remove('disabled');

                if (onlyNode === true && anchorNode.parentNode.tagName === 'A') {
                    action.btn.classList.add('data-linked');
                    const url = anchorNode.parentNode.getAttribute('href');
                    rte.actionbar.parentElement.querySelector('#link-url').value = url;
                } else {
                    action.btn.classList.remove('data-linked');
                    rte.actionbar.parentElement.querySelector('#link-url').value = '';

                    if (selection.type !== 'Range') {
                        action.btn.classList.add('disabled');
                    }
                }

                if (action.previousNode !== selection.anchorNode) {
                    rte.actionbar.parentElement.classList.remove('show-link-editor');
                }

                action.previousNode = anchorNode;
            }, 0);
        }
    });


    const div = document.createElement('div');
    div.setAttribute('id', 'link-details-container');
    div.innerHTML = `
            <div class="link-details">
                <input id="link-url" type="text" placeholder="Enter url">
                <button data-add>
                    <span class="fa fa-check"></span>
                </button>
                <button data-remove>
                    <span class="fa fa-times"></span>
                </button>
            </div>
        `.trim();

    div.addEventListener('click', (e) => {
        const selected = editor.getSelected();

        if (selected == null) {
            return;
        }

        const activeRte = selected.view.activeRte;
        const selection = activeRte.selection();
        const target = e.target;

        const url = (div.querySelector('#link-url')).value.trim();

        if (target == null) {
            return;
        }

        if (target.hasAttribute('data-add')) {
            if (url === '') {
                return;
            }

            if (activeRte.selection().type === 'Range') {
                activeRte.exec('createLink', url);
                activeRte.actionbar.parentElement.classList.remove('show-link-editor');
                activeRte.updateActiveActions();
                return;
            }

            // Updating url
            if (selection.anchorNode.parentNode.tagName === 'A') {
                selection.anchorNode.parentNode.setAttribute('href', url);
                activeRte.actionbar.parentElement.classList.remove('show-link-editor');
                activeRte.updateActiveActions();
                return;
            }
        }

        if (target.hasAttribute('data-remove')) {
            // If we selected a link, remove the whole link
            if (selection.anchorNode.parentNode.tagName === 'A') {
                console.log('remove whole link', selection.anchorNode.parentNode);
                const range = document.createRange();
                range.selectNode(selection.anchorNode.parentNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }

            activeRte.exec('unlink');
            activeRte.actionbar.parentElement.classList.remove('show-link-editor');
            activeRte.updateActiveActions();
        }
    });
    rte.getToolbarEl().append(div);
}
