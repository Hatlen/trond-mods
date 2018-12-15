import Translate from "components/translate";

const C = () => (
  <div>
    <Translate
      count={props.totalVisitors}
      totalViews={numeral(props.totalVisitors).format("0,0")}
      i18nKey="analyze.components.overview_story.total_views"
    />
  </div>
);

export default C;
