import Translate from "components/translate";
import { Component } from "react";

class C extends Component {
  render() {
    const { totalVisitors, copied } = this.props;
    return (
      <div>
        <Translate i18nKey="key" />
        <Translate
          count={totalVisitors}
          totalViews={numeral(totalVisitors).format("0,0")}
          i18nKey="key_with_pluralization"
        />
        <Translate
          count={totalVisitors}
          totalViews={numeral(totalVisitors).format("0,0")}
          i18nKey="key_with_html"
        />
        <Translate
          count={totalVisitors}
          totalViews={numeral(totalVisitors).format("0,0")}
          i18nKey="key_with_pluralization_and_html"
        />
        {copied ? <Translate i18nKey="key" /> : null}
        {this.props.t("key")}
      </div>
    );
  }
}

export default C;
