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
import Translate from 'components/Translate';

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
import Translate from 'components/Translate';

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
import Translate from 'components/Translate';

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
import Translate from 'components/Translate';

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
        `.trim(),
    // 5
    `
import Translate from 'components/Translate';

const C = (props) => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization_and_html"
    />
    {props.t('key')}
  </div>
);

export default C;
        `.trim()
  ]
});
