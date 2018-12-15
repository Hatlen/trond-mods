import pluginTester from "babel-plugin-tester";
import babelI18nPlugin from "./translate-component-to-t-function";

pluginTester({
  plugin: babelI18nPlugin,
  babelOptions: {
    filename: ".babelrc",
    babelrc: true
  },
  snapshot: true,
  tests: [
    `
const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="analyze.components.overview_story.total_views"
    />
  </div>
);
    `.trim()
  ]
});
