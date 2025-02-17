figma.codegen.on("generate", async (event) => {
  return [event.node].map((node: SceneNode) => {
    // Add basic node properties
    const nodeProps = `
      Node Type: ${node.type}
      Name: ${node.name}
      ID: ${node.id}
      Width: ${node.width}px
      Height: ${node.height}px
      X Position: ${node.x}
      Y Position: ${node.y}
    `;

    if (node.type === "RECTANGLE") {
      const fills = node.fills as SolidPaint[];
      if (fills.length > 0 && fills[0].type === "SOLID") {
        const color = fills[0].color;
        const rgbColor = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
        return {
          title: "Rectangle Element Properties",
          language: "HTML",
          code: `
<!-- Node Properties -->
<!--
${nodeProps}
Color: ${rgbColor}
-->

<div style="width:${node.width}px; height:${node.height}px; background-color:${rgbColor};"></div>`
        };
      }
    }
    return {
      title: "Node Properties",
      language: "HTML",
      code: `
<!-- Node Properties -->
<!--
${nodeProps}
-->

<!-- Unsupported node type: ${node.type} -->`
    };
  });
});
