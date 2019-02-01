const editor = grapesjs.init({
    container: "#gjs",
    fromElement: false,
    // Size of the editor
    height: "300px",
    width: "auto",
    // Disable the storage manager for the moment
    storageManager: {type: null},
    panels: {defaults: []},
    autorender: 0,
    canvas: {
        styles: ['css/iframe.css']
    }
});

editor.DomComponents.getWrapper().set({
    badgable: false,
    selectable: false,
    highlightable: false
});

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
rte.add('insertHTML', {
    icon: `INS`,
    attributes: {title: 'Insert'},
    result: rt => rt.insertHTML(`<span data-stylable="true" style="background:rgba(255,0,0, 0.1)">${rt.selection()}</span>`)
});

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
  
        <div style="margin-top: 60px;">
            text <a href="#">link</a>
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
