import template from "@babel/template";
import { looksLike } from "../utils";

const withNamespacesImportAST = template(
  `
  import { withNamespaces } from 'react-i18next';
`
)();

export default function(babel) {
  const { types: t } = babel;

  return {
    name: "Translate-to-withNamespaces-t",
    visitor: {
      JSXElement(path, { file, opts }) {
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
          const options = getOptions(opts);
          const attributes = path.node.openingElement.attributes;
          const key = attributes.find(
            n => n.name.name === "i18nKey"
          ).value.value;
          const objectPropertyNodes = attributes.filter(
            n => n.name.name !== "i18nKey"
          );

          // transform <Translate i18nKey="key" name={props.name} />
          // to { t('key', { name: props.name }) }

          const tFunctionCall = t.callExpression(
            t.identifier("t"),
            [
              t.stringLiteral(key),
              objectPropertyNodes.length
                ? t.objectExpression(
                    objectPropertyNodes.map(node =>
                      t.objectProperty(
                        t.identifier(node.name.name),
                        node.value.expression
                      ))
                  )
                : null
            ].filter(args => args)
          );

          if (!options.allTranslations) {
            throw new Error(
              "You must provide an allTranslations object when initializing " +
                "the plugin"
            );
          }

          const translationContainsHTML = Object.keys(
            options.allTranslations
          ).find(localeKey => {
            const translations = options.allTranslations[localeKey];
            const translation = getTranslation(translations, key.split("."));
            if (!translation) {
              throw new Error(`Missing translation for ${localeKey}.${key}`);
            }
            if (typeof translation === "object") {
              return Object.keys(
                translation
              ).find(objectTranslationKey =>
                translation[objectTranslationKey].match(/</));
            } else {
              return translation.match(/</);
            }
          });

          path.replaceWith(
            t.jsxExpressionContainer(
              translationContainsHTML
                ? t.callExpression(t.identifier("safeT"), [tFunctionCall])
                : tFunctionCall
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
            const translateImportIndex = path.node.body.findIndex(
              node => looksLike(node, {
                type: "ImportDeclaration",
                specifiers: specifiers => looksLike(specifiers[0], {
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
            const hasWithNamespacesImport = path.node.body.find(
              node => looksLike(node, {
                type: "ImportDeclaration",
                specifiers: specifiers => looksLike(specifiers[0], {
                  type: "ImportSpecifier",
                  local: {
                    name: "withNamespaces"
                  }
                })
              })
            );
            if (!hasWithNamespacesImport) {
              path.unshiftContainer("body", withNamespacesImportAST);

              const exportDeclaration = path.node.body.find(
                node => looksLike(node, {
                  type: "ExportDefaultDeclaration"
                })
              );
              const exportDeclarationIndex = path.node.body.indexOf(
                exportDeclaration
              );
              path
                .get(`body.${exportDeclarationIndex}`)
                .replaceWith(
                  t.exportDefaultDeclaration(
                    t.callExpression(t.identifier("withNamespaces"), [
                      exportDeclaration.declaration
                    ])
                  )
                );
            }
          }
        }
      }
    }
  };
}

const getTranslation = (translations, [key, ...rest]) => {
  if (rest.length) {
    return getTranslation(translations[key], rest);
  }
  return translations[key];
};

const getOptions = opts => ({
  allTranslations: opts.allTranslations
});
