import Translate from "components/translate";

const C = () => (
  <div>
    <Translate i18nKey="key" />
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization"
    />
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_html"
    />
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="key_with_pluralization_and_html"
    />
  </div>
);

export default C;
