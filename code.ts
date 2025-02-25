figma.showUI(__html__, { width: 400, height: 500, themeColors: true });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'ready') {
    const selection = figma.currentPage.selection;

    if (selection.length > 0) {
      const nodes = selection;
      const exportPromises = nodes.map(node => node.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 2 }
      }));

      Promise.all(exportPromises).then(images => {
        figma.ui.postMessage({
          type: 'image-bytes',
          images: images
        });
      }).catch(error => {
        console.error("Error exporting nodes:", error);
        figma.notify("Error exporting selected nodes. Check the console for details.");
        figma.ui.postMessage({ type: 'export-error', error: error.message }); // Send error to UI
      });
    } else {
      figma.notify("No nodes selected. Please select nodes to export.");
      figma.ui.postMessage({ type: 'no-selection' }); // Notify UI about no selection
    }
  }
};

figma.on("selectionchange", () => {
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    const nodes = selection;
    const exportPromises = nodes.map(node => node.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 2 }
    }));

    Promise.all(exportPromises).then(images => {
      figma.ui.postMessage({
        type: 'image-bytes',
        images: images
      });
    }).catch(error => {
      console.error("Error exporting nodes:", error);
      figma.notify("Error exporting selected nodes. Check the console for details.");
      figma.ui.postMessage({ type: 'export-error', error: error.message }); // Send error to UI

    });
  } else {
    figma.ui.postMessage({ type: 'no-selection' }); // Notify UI about no selection
  }
});

figma.on("run", (event) => {
  if (event.command === "run-plugin") {
    // No need to call showUI here, it's already called at the start
  }
});