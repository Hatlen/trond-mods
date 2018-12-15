const looksLike = require("./utils").looksLike;

export default function(babel) {
  const { types: t } = babel;

  return {
    name: "Translate-to-withNamespaces-t",
    visitor: {
      JSXElement(path) {
        // transform <Translate i18nKey="key" name={props.name} />
        // to { t('key', { name: props.name }) }
        if (
          looksLike(path.node, {
            openingElement: {
              name: {
                name: "Translate"
              }
            }
          })
        ) {
          const attributes = path.node.openingElement.attributes;
          const key = attributes.find(n => n.name.name === "i18nKey").value
            .value;
          const objectPropertyNodes = attributes.filter(
            n => n.name.name !== "i18nKey"
          );

          path.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(t.identifier("t"), [
                t.stringLiteral(key),
                t.objectExpression(
                  objectPropertyNodes.map(node =>
                    t.objectProperty(
                      t.identifier(node.name.name),
                      node.value.expression
                    )
                  )
                )
              ])
            )
          );
        }
      }
    }
  };
}
