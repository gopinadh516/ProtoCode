// Handle both the command and selection changes
figma.on("run", (event) => {
  if (event.command === "generate-html") {
    showUI();
  }
});

figma.on("selectionchange", () => {
  showUI();
});

// Extract the common UI showing logic
function showUI() {
  figma.showUI(__html__, { 
    width: 400, 
    height: 500,
    themeColors: true 
  });

  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const node = selection[0];
    if (node.type === "RECTANGLE") {
      node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      }).then(bytes => {
        figma.ui.postMessage({
          type: 'image-bytes',
          bytes: bytes
        });
      });
    }
  }
}

// Keep the existing message handler
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ready') {
    if (figma.editorType === "dev") {
      const numChildren = figma.currentPage.children.length;
      figma.notify(`Dev Mode: Current page has ${numChildren} children`);
    } else {
      const node = figma.createRectangle();
      node.name = "Generated Rectangle";
      node.resize(100, 100);
      node.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 0, b: 0 }
      }];

      const bytes = await node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      });

      figma.ui.postMessage({
        type: 'image-bytes',
        bytes: bytes
      });
    }
  }
};