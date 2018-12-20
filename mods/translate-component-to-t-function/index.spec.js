import pluginTester from "babel-plugin-tester";
import babelI18nPlugin from "./";

pluginTester({
  plugin: babelI18nPlugin,
  pluginOptions: {
    allTranslations: {
      en: {
        key: "value",
        key_with_pluralization: {
          one: "one value",
          many: "many value"
        },
        key_with_html: "<em>Welcome</em>",
        key_with_pluralization_and_html: {
          one: "no html",
          many: "<div>MANY!</div>"
        }
      },
      sv: {
        key: "värde",
        key_with_pluralization: {
          one: "1 värde"
        },
        key_with_html: "<em>Welcome</em>",
        key_with_pluralization_and_html: {
          one: "no html",
          many: "<div>MANY!</div>"
        }
      }
    }
  },
  babelOptions: {
    filename: ".babelrc",
    babelrc: true
  },
  snapshot: true,
  tests: [
    `
const C = (props) => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key"
    />
  </div>
);

export default C;
        `.trim(),
    `
const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization"
    />
  </div>
);

export default C;
        `.trim(),
    `
// Simplified file without import or export
const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_html"
    />
  </div>
);

export default C;
        `.trim(),
    `
// Simplified file without import or export
const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization_and_html"
    />
  </div>
);

export default C;
        `.trim()
  ]
});
