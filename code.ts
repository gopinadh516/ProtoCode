

(() => {
  // Show UI with reasonable size
  figma.showUI(__html__, { width: 800, height: 800, themeColors: true });

  // Handle messages from UI
  figma.ui.onmessage = async (msg) => {
      if (msg.type === 'ready') {
          await handleSelection();
      }
  };

  // Handle selection changes
  figma.on("selectionchange", async () => {
      await handleSelection();
  });

  // Main function to handle selection processing
  async function handleSelection() {
      const selection = figma.currentPage.selection;
      
      if (selection.length > 0) {
          const nodes = selection;
          const exportData = nodes.map(node => ({
              json: processNode(node),
              imagePromise: node.exportAsync({
                  format: 'PNG',
                  constraint: { type: 'SCALE', value: 2 }
              })
          }));

          try {
              const results = await Promise.all(
                  exportData.map(async data => ({
                      json: data.json,
                      image: await data.imagePromise
                  }))
              );

              figma.ui.postMessage({
                  type: 'export-data',
                  data: results
              });
          } catch (error) {
              console.error("Error exporting nodes:", error);
              figma.notify("Error exporting selected nodes");
              figma.ui.postMessage({ 
                  type: 'export-error', 
                  error: error instanceof Error ? error.message : 'Unknown error'
              });
          }
      } else {
          figma.ui.postMessage({ type: 'no-selection' });
      }
  }

  // Function to process node data
  function processNode(node: SceneNode): any {
      const obj: any = {
          type: node.type,
          id: node.id,
          name: node.name
      };

      // Handle common properties
      if ('x' in node) obj.x = node.x;
      if ('y' in node) obj.y = node.y;
      if ('width' in node) obj.width = node.width;
      if ('height' in node) obj.height = node.height;

      // Handle specific node types
      switch (node.type) {
          case 'TEXT':
              if ('characters' in node) {
                  obj.characters = node.characters;
                  obj.fontSize = node.fontSize;
                  obj.fontName = node.fontName;
                  obj.textAlignHorizontal = node.textAlignHorizontal;
                  obj.textAlignVertical = node.textAlignVertical;
              }
              break;

          case 'RECTANGLE':
          case 'ELLIPSE':
          case 'POLYGON':
          case 'STAR':
          case 'VECTOR':
              if ('fills' in node) {
                  obj.fills = node.fills;
                  obj.fillStyleId = node.fillStyleId;
              }
              if ('strokes' in node) {
                  obj.strokes = node.strokes;
                  obj.strokeStyleId = node.strokeStyleId;
                  obj.strokeWeight = node.strokeWeight;
                  obj.strokeAlign = node.strokeAlign;
              }
              if ('cornerRadius' in node && node.type === 'RECTANGLE') {
                  obj.cornerRadius = node.cornerRadius;
              }
              break;

          case 'FRAME':
          case 'GROUP':
          case 'COMPONENT':
          case 'INSTANCE':
              if ('children' in node) {
                  obj.children = node.children.map(child => 
                      processNode(child as SceneNode)
                  );
              }
              if ('layoutMode' in node) {
                  obj.layoutMode = node.layoutMode;
                  obj.primaryAxisSizingMode = node.primaryAxisSizingMode;
                  obj.counterAxisSizingMode = node.counterAxisSizingMode;
                  obj.primaryAxisAlignItems = node.primaryAxisAlignItems;
                  obj.counterAxisAlignItems = node.counterAxisAlignItems;
                  
                  if ('paddingLeft' in node) {
                      obj.padding = {
                          left: node.paddingLeft,
                          right: node.paddingRight,
                          top: node.paddingTop,
                          bottom: node.paddingBottom
                      };
                  }
                  
                  if ('itemSpacing' in node) {
                      obj.itemSpacing = node.itemSpacing;
                  }
              }
              break;

          case 'BOOLEAN_OPERATION':
              if ('children' in node) {
                  obj.children = node.children.map(child => 
                      processNode(child as SceneNode)
                  );
              }
              obj.booleanOperation = node.booleanOperation;
              break;
      }

      return obj;
  }

  // Initialize plugin
  figma.on("run", () => {
      // Plugin is already initialized via showUI
  });
})();