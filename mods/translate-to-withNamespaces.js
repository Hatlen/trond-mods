const looksLike = require("./utils").looksLike;

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
