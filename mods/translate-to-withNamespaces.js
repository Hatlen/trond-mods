export default function(babel) {
  const { types: t } = babel;

  return {
    name: "translate-to-withNamespaces",
    visitor: {
      ImportDeclaration(path) {
        if (
          looksLike(path.node, {
            specifiers: array =>
              array.length === 1 &&
              looksLike(array[0], {
                type: "ImportSpecifier",
                imported: {
                  type: "Identifier",
                  name: "translate"
                }
              })
          })
        ) {
          path.scope.rename("translate", "withNamespaces");
          path.node.specifiers[0].imported.name = "withNamespaces";
        }
      }
    }
  };
}

const looksLike = (node, wantedNode) =>
  node &&
  wantedNode &&
  Object.keys(wantedNode).every(key => {
    const nodeValue = node[key];
    const wantedNodeValue = wantedNode[key];
    if (typeof wantedNodeValue === "function") {
      return wantedNodeValue(nodeValue);
    }
    return primitive(wantedNode)
      ? nodeValue === wantedNodeValue
      : looksLike(nodeValue, wantedNodeValue);
  });

const primitive = value =>
  value == null || (typeof value).match(/^(string|number|boolean)/);
