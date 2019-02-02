const editor = grapesjs.init({
    container: "#gjs",
    fromElement: false,
    // Size of the editor
    height: "600px",
    width: "auto",
    // Disable the storage manager for the moment
    storageManager: {type: null},
    // panels: {defaults: []},
    autorender: 0,
    canvas: {
        styles: ['css/iframe.css'],
        notTextable: ['button', 'a', 'input[type=checkbox]', 'input[type=radio]']
    }
});

// Debugging only
setTimeout(() => {
editor.getWrapper().view.el.ownerDocument.defaultView.editor = editor;

}, 500);

editor.DomComponents.getWrapper().set({
    badgable: false,
    selectable: false,
    highlightable: false
});

const rte = editor.RichTextEditor;
extendDefaultRtePrototype(rte);

['bold', 'italic', 'strikethrough', 'underline', 'link'].forEach(i => rte.remove(i));
['Bold', 'Italic', 'Underline', 'CreateLink', 'Unlink', 'InsertOrderedList'].forEach(opt => {
    const lowerCaseOpt = opt.toLowerCase();
    rte.add(lowerCaseOpt, {
        icon: `<span class="fa fa-${lowerCaseOpt}"></span>`,
        attributes: {title: opt},
        result: (rt, action) => {

            if (lowerCaseOpt === 'insertorderedlist' || lowerCaseOpt === 'insertunorderedlist') {
                rt.exec(lowerCaseOpt);
                const selection = rt.selection();
                let range = rt.doc.createRange();
                let position = null;

                range.selectNode(selection.anchorNode);
                position = range.getBoundingClientRect();

                // Reload view
                let child = editor.getSelected();
                child.view.disableEditing({disableRte: false});
                child.view.onActive();
                editor.getSelected().view.el.focus();

                setTimeout(() => {
                    const el = rt.doc.elementFromPoint(position.x, position.y);

                    range.selectNode(el);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    selection.collapseToEnd();

                    el.click();
                }, 0);

                return;
            }

            const selection = rt.selection();
            const position = selection.getRangeAt(0).getBoundingClientRect();

            if (selection.type === 'Range') {
                rt.exec(lowerCaseOpt);

                let child = editor.getSelected();
                child.view.disableEditing({disableRte: false});
                child.view.onActive();
                editor.getSelected().view.el.focus();

                setTimeout(() => {
                    const el = rt.doc.elementFromPoint(position.x, position.y);
                    const newPosition = el.getBoundingClientRect();
                    const range = rt.doc.caretRangeFromPoint(newPosition.x + newPosition.width, newPosition.y);

                    selection.removeAllRanges();
                    selection.addRange(range);

                    el.click();
                }, 0);

                return;
            }




            // // TODO: not working
            // if (action.btn.classList.contains('gjs-rte-active')) {
            //     let child = editor.getSelected();
            //     child.view.disableEditing({disableRte: false});
            //     child.view.onActive();
            //
            //     setTimeout(() => {
            //         const el = rt.doc.elementFromPoint(position.x, position.y);
            //         const range = rt.doc.caretRangeFromPoint(Math.floor(position.x + position.width), position.y);
            //
            //         const space = document.createElement("span");
            //         space.innerHTML = "\u200B";
            //
            //         range.insertNode(space);
            //         range.collapse(false);
            //
            //
            //
            //         selection.removeAllRanges();
            //         selection.addRange(range);
            //         el.click();
            //     }, 0);
            // }
            // editor.getSelected().view.el.focus();
        }
    });
});
// rte.add('ordered-list', {
//     icon: `<span class="fa fa-list-ol"></span>`,
//     attributes: {
//         title: 'OL'
//     },
//     result: rt => {
//         rt.exec('insertOrderedList');
//         editor.getSelected().view.el.focus();
//     }
// });
//
// rte.add('ordered-list', {
//     icon: `<span class="fa fa-list-ul"></span>`,
//     attributes: {
//         title: 'UL'
//     },
//     result: rt => {
//         rt.exec('insertUnorderedList');
//         editor.getSelected().view.el.focus();
//     }
// });

// Extending default type with helper methods
extendDefaultPrototype(editor);

// Define custom types
defineText(editor);
defineLink(editor);
defineSpan(editor);
// defineStylables(editor);
// defineParagraph(editor);
defineList(editor);

// extendText(editor); // Must be first
// extendRichTextEditor(editor);
// mergeTextTypes(editor); // Must be last

// Render
setTimeout(() => {
    editor.setComponents(`
        
        <div style="margin-top: 60px;">
            text <a href="#">link</a>
        </div>
  
        <div>
            hello

            <!--<p>Hej</p>-->
    <!---->
            <!--<p><a href="google" target="here">link</a></p>-->
    
            <ul>
                <li>1 item</li>
                <li>2 item</li>
            </ul>
    
            <ol>
                <li>1 item</li>
                <li>2 item</li>
            </ol>
    </div>
    `.trim());
    editor.render();
}, 0);

/*
    <div>
        hello

        <p>Hej</p>

        <p><a href="google" target="here">link</a></p>

        <ul>
            <li>1 item</li>
            <li>2 item</li>
        </ul>

        <ol>
            <li>1 item</li>
            <li>2 item</li>
        </ol>
    </div>
 */
