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

// Define custom types

extendRTE(editor);
extendText(editor);



mergeTextTypes(editor); // Must be last

// Render
setTimeout(() => {
    console.log('editor.render()');
    editor.setComponents(`
    <div data-rte>
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
    
    <div>
    name me
    <a href="google" target="_blank">link</a>
    
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
