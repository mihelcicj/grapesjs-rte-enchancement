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

// Commands
// const deleteCommand = editor.Commands.get('core:component-delete');
// const runFunction = deleteCommand.run;
// deleteCommand.run = function(ed, sender, opt = {}) {
//     console.log(ed, sender, opt);
//     if (sender != null) {
//         ed.getSelected().view.disableEditing();
//     }
//     runFunction(ed, sender, opt);
// };

editor.Commands.get('tlb-delete').run = function(ed) {
    ed.getSelected().view.disableEditing();
    ed.runCommand('core:component-delete')
};

editor.Commands.get('tlb-clone').run = function(ed) {
    ed.getSelected().view.disableEditing();
    ed.runCommand('core:copy');
    ed.runCommand('core:paste');
};

// Define custom types

extendRTE(editor);
extendText(editor);



mergeTextTypes(editor); // Must be last

// Render
setTimeout(() => {
    console.log('editor.render()');
    editor.setComponents(`
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
        
    `.trim());
    editor.render();
}, 0);
