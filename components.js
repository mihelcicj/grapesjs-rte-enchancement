function extendRTE(editor) {
    const rte = editor.RichTextEditor;

    {
        const div = document.createElement('div');
        div.classList.add('test');
        div.innerHTML = `
            <div class="link-details">
                <input id="link-url" type="text">
                <button data-add>OK</button> 
                <button data-remove>REM</button> 
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

            const url = div.querySelector('#link-url').value.trim();

            if (target == null) {
                return;
            }

            console.log('selection', selection);

            if (target.hasAttribute('data-add')) {

                if (url === '') {
                    return;
                }
                if (activeRte.selection().type !== 'Range') {
                    return;
                }


                activeRte.exec('createLink', url);
                // Does not work if the selection spans more than one node
                // selection.anchorNode.parentNode.setAttribute('target', '_blank');

                // if (selection.anchorNode.parentNode.tagName === 'A') {
                //     selection.anchorNode.parentNode.setAttribute('href', url);
                // } else {
                //     if (activeRte.selection().type !== 'Range') { return; }
                //
                //     activeRte.insertHTML(`
                //         <a href="${url}" target="_blank">${activeRte.selection()}</a>
                //     `.trim());
                // }
            }

            if (target.hasAttribute('data-remove')) {
                // If we selected a link, remove the whole link
                if (selection.anchorNode.parentNode.tagName === 'A') {
                    const range = document.createRange();
                    range.selectNode(selection.anchorNode.parentNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                activeRte.exec('unlink');
            }

            activeRte.updateActiveActions();
        });
        rte.getToolbarEl().append(div);
        console.log('r', rte);
    }

    ["strikethrough", "link"].forEach(i => rte.remove(i));

    console.log("ext", rte);
    rte.add("ordered-list", {
        icon: "<b>OL</b>",
        attributes: {
            title: "OL"
        },
        result: rte => {
            rte.exec("insertOrderedList");
            editor.getSelected().view.el.focus();
        }
    });

    rte.add("ordered-list", {
        icon: "<b>UL</b>",
        attributes: {
            title: "UL"
        },
        result: rte => {
            rte.exec("insertUnorderedList");
            editor.getSelected().view.el.focus();
        }
    });

    rte.add("link", {
        icon: `
            <div>
             <span>link</span>
             <div class="link-active-indicator"></div>
            </div>
        `.trim(),
        attributes: {
            title: "Link",
            id: "rte-link"
        },
        result: (rte, action) => {
            console.log(action);
            action.btn.classList.toggle('data-linked');
            const selection = rte.selection();
            if (selection.type.toLowerCase() !== 'range') {
                return;
            }

            // console.log(rte.selection());
            // rte.insertHTML(`
            //
            //     <a href="#">${rte.selection()}</a>
            //
            // `.trim());
            // editor.getSelected().view.el.focus();
        },
        update: (rte, action) => {
            console.log('updated action');
            console.log(rte);
            const selection = rte.selection();
            const anchorNode = selection.anchorNode;
            const onlyNode = anchorNode === selection.extentNode;

            if (onlyNode === true && anchorNode.parentNode.tagName === 'A') {

                action.btn.classList.add('data-linked');

                const url = anchorNode.parentNode.getAttribute('href');
                rte.actionbar.parentElement.querySelector('#link-url').value = url;
            } else {
                action.btn.classList.remove('data-linked');
                rte.actionbar.parentElement.querySelector('#link-url').value = '';

            }
        }
    });
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
    })
}
