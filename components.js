function extendRTE(editor) {
    const rte = editor.RichTextEditor;

    {
        const div = document.createElement('div');
        div.setAttribute('id', 'link-details-container');
        div.innerHTML = `
            <div class="link-details">
                <input id="link-url" type="text" placeholder="Enter url">
                <button data-add>
                    <span style="font-size: 14px;" class="fa fa-check"></span>
                </button> 
                <button data-remove>
                    <span style="font-size: 14px;" class="fa fa-times"></span>
                </button> 
            </div>
        `.trim();
        div.addEventListener('click', (e) => {
            console.log('fired click');
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
            console.log(activeRte);

            if (target.hasAttribute('data-add')) {

                if (url === '') {
                    return;
                }

                // if (activeRte.selection().type !== 'Range') {
                //     return;
                // }

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


                // activeRte.exec('createLink', url);
                // activeRte.actionbar.parentElement.classList.remove('show-link-editor');
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
                // activeRte.updateActiveActions();
            }

            if (target.hasAttribute('data-remove')) {
                // If we selected a link, remove the whole link
                if (selection.anchorNode.parentNode.tagName === 'A') {
                    const range = document.createRange();
                    range.selectNode(selection.anchorNode.parentNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    // activeRte.exec('unlink');
                    // selection.collapse(selection.anchorNode.parentNode, 0);
                }

                activeRte.exec('unlink');
                activeRte.actionbar.parentElement.classList.remove('show-link-editor');
                activeRte.updateActiveActions();
            }

            // activeRte.updateActiveActions();
        });
        rte.getToolbarEl().append(div);
        console.log('r', rte);
    }

    ["strikethrough", "link"].forEach(i => rte.remove(i));

    console.log("ext", rte);
    rte.add("ordered-list", {
        icon: `<span style="font-size: 14px;" class="fa fa-list-ol"></span>`,
        attributes: {
            title: "OL"
        },
        result: rte => {
            rte.exec("insertOrderedList");
            editor.getSelected().view.el.focus();
        }
    });

    rte.add("ordered-list", {
        icon: `<span style="font-size: 14px;" class="fa fa-list-ul"></span>`,
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
             <span style="display: block; transform:rotate(45deg)">&supdsub;</span>
             <div class="link-active-indicator"></div>
            </div>
        `.trim(),
        attributes: {
            title: "Link",
            id: "rte-link"
        },
        result: (rte, action) => {
            if (action.btn.classList.contains('disabled')) { return; }

            action.btn.parentNode.parentNode.classList.toggle('show-link-editor');

            // action.btn.classList.toggle('data-linked');
            // const selection = rte.selection();
            // if (selection.type.toLowerCase() !== 'range') {
            //     return;
            // }

            // console.log(rte.selection());
            // rte.insertHTML(`
            //
            //     <a href="#">${rte.selection()}</a>
            //
            // `.trim());
            // editor.getSelected().view.el.focus();
        },
        update: (rte, action) => {
            console.log('ACT', action);
            // console.log('updated action');
            // console.log(rte);
            const selection = rte.selection();
            const anchorNode = selection.anchorNode;
            const onlyNode = anchorNode === selection.extentNode;

            // Selection is not updated until next tick
            setTimeout(() => {
                // console.log(selection.type, selection);
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

                    // if (selection.type !== 'Range') {
                    //     rte.actionbar.parentElement.classList.remove('show-link-editor');
                    // }
                }

                if (action.previousNode !== selection.anchorNode) {
                    rte.actionbar.parentElement.classList.remove('show-link-editor');
                }

                action.previousNode = anchorNode;



            }, 0);
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
