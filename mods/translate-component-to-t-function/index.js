import template from "@babel/template";
import { looksLike } from "../utils";
const parser = require("@babel/parser");

const withNamespacesImportAST = template(
  `
  import { withNamespaces } from 'react-i18next';
`
)();
const safeTImportAST = template(
  `
  import safeT from 'lib/safeT';
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
          const keyNode = attributes.find(n => n.name.name === "i18nKey");
          const objectPropertyNodes = attributes.filter(
            n => n.name.name !== "i18nKey"
          );

          // transform <Translate i18nKey="key" name={props.name} />
          // to { t('key', { name: props.name }) }

          let functionCall = t.callExpression(
            t.identifier("t"),
            [
              keyNode.value.type === "StringLiteral"
                ? keyNode.value
                : keyNode.value.expression,
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

          if (keyNode.value.type === "StringLiteral") {
            const key = keyNode.value.value;
            const translationContainsHTML = Object.keys(
              options.allTranslations
            ).find(localeKey => {
              const translations = options.allTranslations[localeKey];
              const translation = getTranslation(translations, key.split("."));
              if (!translation) {
                const fallbackLocale = options.allTranslations[
                  options.fallbackLocale
                ];
                if (getTranslation(fallbackLocale, key.split("."))) {
                  console.log(`Missing translation for ${localeKey}.${key}`);
                  return;
                } else {
                  throw new Error(
                    `Missing translation for ${localeKey}.${key}`
                  );
                }
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

            if (translationContainsHTML) {
              functionCall = t.callExpression(t.identifier("safeT"), [
                functionCall
              ]);
              file.set("needsSafeT");
            }
          } else {
            console.log(
              `KeyNode is not a StringLiteral TODO check if the translation contains html and needs to be wrapped with safeT: ${path.getSource()}`
            );
          }

          if (path.parent.type === "JSXElement") {
            path.replaceWith(t.jsxExpressionContainer(functionCall));
          } else {
            path.replaceWith(functionCall);
          }

          // Make sure t is in scope in ArrowFunctions
          const parentComponentArrowFunction = path.findParent(
            n => looksLike(n, {
              type: "ArrowFunctionExpression",
              parent: {
                type: "VariableDeclarator"
              }
            })
          );

          const parentRenderFunction = path.findParent(n => looksLike(n, {
            type: "ClassMethod",
            node: {
              key: {
                name: "render"
              }
            }
          }));

          if (parentComponentArrowFunction) {
            const params = parentComponentArrowFunction.node.params;
            switch (params.length) {
              case 0:
                parentComponentArrowFunction.node.params = [destructureT()];
                break;
              case 1:
                parentComponentArrowFunction.node.params = [
                  destructureT(params[0])
                ];
                file.set(
                  "destructuredTFromProps",
                  file
                    .get("destructuredTFromProps")
                    .add(parentComponentArrowFunction)
                );
                break;
              default:
                // to many
                throw new Error(
                  "To many parameters for component arrow function"
                );
            }
          } else if (parentRenderFunction) {
            const declarations = parentRenderFunction.node.body.body.filter(
              node => looksLike(node, {
                type: "VariableDeclaration",
                declarations: declarations =>
                  declarations.find(declaration => looksLike(declaration, {
                    type: "VariableDeclarator",
                    init: {
                      property: {
                        name: "props"
                      }
                    }
                  }))
              })
            );

            switch (declarations.length) {
              case 0:
                const tDestructuring = parser.parse(
                  "const { t } = this.props;"
                );
                parentRenderFunction.node.body.body.unshift(tDestructuring);
                break;
              case 1:
                destructureT(declarations[0].declarations[0].id);
                break;
              default:
                throw new Error(
                  "Too many props destructuring declarations, expected just one"
                );
            }

            file.set(
              "destructuredTFromProps",
              file.get("destructuredTFromProps").add(parentRenderFunction)
            );
          } else {
            console.log(
              "Oh no not an component arrow function or a class render function, TODO: manually make sure t function is in scope"
            );
          }
        }
      },
      Program: {
        enter(path, { file }) {
          file.set("hadTranslate", false);
          file.set("needsSafeT", false);
          file.set("destructuredTFromProps", new Set());
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

            if (file.get("needsSafeT")) {
              // Add safeT import
              path.unshiftContainer("body", safeTImportAST);
            }

            // use the t identifier directly instead of from props or from
            // this.props
            const destructuredTFromProps = file.get("destructuredTFromProps");
            if (destructuredTFromProps.size) {
              path.traverse({
                MemberExpression(path) {
                  if (
                    (looksLike(path.node, {
                      object: {
                        type: "Identifier",
                        name: "props"
                      },
                      property: {
                        type: "Identifier",
                        name: "t"
                      }
                    }) ||
                      looksLike(path.node, {
                        object: {
                          type: "MemberExpression",
                          object: {
                            type: "ThisExpression"
                          },
                          property: {
                            name: "props"
                          }
                        },
                        property: {
                          type: "Identifier",
                          name: "t"
                        }
                      })) &&
                    path.find(path => destructuredTFromProps.has(path))
                  ) {
                    path.replaceWith(t.identifier("t"));
                  }
                }
              });
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
                    t.callExpression(
                      t.callExpression(t.identifier("withNamespaces"), []),
                      [exportDeclaration.declaration]
                    )
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
  allTranslations: opts.allTranslations,
  fallbackLocale: "en"
});

const destructureT = param => {
  const tDestructuring = parser.parseExpression("({ t }) => {}").params[0];
  const tAndPropsDestructuring = parser.parseExpression(
    "({ t, ...props }) => {}"
  ).params[0];

  if (!param) {
    return tDestructuring;
  }
  if (
    looksLike(param, {
      type: "Identifier",
      name: "props"
    })
  ) {
    return tAndPropsDestructuring;
  }
  if (param.type === "Identifier") {
    throw new Error(`The parameter was named ${param.name}, expected "props"`);
  }

  // change nothing if t is already destructured
  if (
    looksLike(param, {
      type: "ObjectPattern",
      properties: nodes => nodes.find(node => {
        return looksLike(node, {
          type: "ObjectProperty",
          key: {
            type: "Identifier",
            name: "t"
          },
          value: {
            type: "Identifier",
            name: "t"
          }
        });
      })
    })
  ) {
    return param;
  }

  // Otherwise if params is an ObjectPattern merge in the t ObjectProperty
  if (
    looksLike(param, {
      type: "ObjectPattern"
    })
  ) {
    param.properties.unshift(tDestructuring.properties[0]);
    return param;
  }

  // This shouldn't happen
  console.log({ param });
  throw new Error(`Unexpected first parameter: ${param}`);
};
