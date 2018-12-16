import template from "@babel/template";
import { looksLike } from "./utils";

const withNamespacesImportAST = template(`
  import { withNamespaces } from 'react-i18next';
`)();

export default function(babel) {
  const { types: t } = babel;

  return {
    name: "Translate-to-withNamespaces-t",
    visitor: {
      JSXElement(path, { file }) {
        if (
          looksLike(path.node, {
            openingElement: {
              name: {
                name: "Translate"
              }
            }
          })
        ) {
          file.set("hadTranslate", true);
          const attributes = path.node.openingElement.attributes;
          const key = attributes.find(n => n.name.name === "i18nKey").value
            .value;
          const objectPropertyNodes = attributes.filter(
            n => n.name.name !== "i18nKey"
          );

          // transform <Translate i18nKey="key" name={props.name} />
          // to { t('key', { name: props.name }) }
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
      },
      Program: {
        enter(path, { file }) {
          file.set("hadTranslate", false);
        },
        exit(path, { file }) {
          if (file.get("hadTranslate")) {
            // Remove Translate import
            const translateImportIndex = path.node.body.findIndex(node =>
              looksLike(node, {
                type: "ImportDeclaration",
                specifiers: specifiers =>
                  looksLike(specifiers[0], {
                    type: "ImportDefaultSpecifier",
                    local: {
                      name: "Translate"
                    }
                  })
              })
            );

            if (translateImportIndex >= 0) {
              path.get(`body.${translateImportIndex}`).remove();
            }

            // Add withNamespacesImport
            const hasWithNamespacesImport = path.node.body.find(node =>
              looksLike(node, {
                type: "ImportDeclaration",
                specifiers: specifiers =>
                  looksLike(specifiers[0], {
                    type: "ImportSpecifier",
                    local: {
                      name: "withNamespaces"
                    }
                  })
              })
            );
            if (!hasWithNamespacesImport) {
              path.unshiftContainer("body", withNamespacesImportAST);
            }
          }
        }
      }
    }
  };
}
