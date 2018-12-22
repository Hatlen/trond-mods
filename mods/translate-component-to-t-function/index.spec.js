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
    // 1
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
    // 2
    `
const C = ({ t }) => (
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
    // 3
    `
// Simplified file without import or export
const C = ({ totalVisitors }) => (
  <div>
    <Translate
      count={totalVisitors}
      totalViews={numeral(totalVisitors).format("0,0")}
      i18nKey="key_with_html"
    />
  </div>
);

export default C;
        `.trim(),
    // 4
    `
// Simplified file without import or export
const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization_and_html"
    />
    {something ? (<Translate i18nKey="key" />) : (<Translate i18nKey="key" />)}
  </div>
);

export default C;
        `.trim()
  ]
});
