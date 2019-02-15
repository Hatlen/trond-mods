# trond-mods

This repository contains a random collection of codemod scripts for use with
[codemod (babel)](https://github.com/codemod-js/codemod)

## Replace react-i18next translate with withNamespaces

Newer versions of react-i18next has renamed it's translate component to
withNamespaces, so:

```javascript
import { translate } from "react-i18next";

const SmallComponent = ({ t }) => <div>{t("translation_key")}</div>;

export default translate()(SmallComponent);
```

should be transformed to:

```javascript
import { withNamespaces } from "react-i18next";

const SmallComponent = ({ t }) => <div>{t("translation_key")}</div>;

export default withNamespaces()(SmallComponent);
```

## Replace Translate component with t function

This codemod replaces a custom react component that was used in a work
project with react-i18next's t method. We to simplify the code a bit by
standardizing on one way of doing translations and since the Translate
component both connected to the react-i18next context/provider and
dangerouslySetInnerHTML all the time, we wanted to use the t function so that
we would just dangerouslySetInnerHTML when we had a translation that
contained html and only connect each component once to the react-i18next
context/provider.

So this component isn't going to work with anyone elses code, but hopefully it
could be a valuable as some sort of reference for someone that's faced with a
similar problem.

To be able to check if an existing translation contains html this codemod
takes a json object with your translations as the Translate-to-withNamespaces-t
config (see package.json codemod script for how to send options to codemod with
a json file). The translation object should then have the locale keys under the
allTranslations key, like in the allTranslations.json
file:

```javascript
{
  "allTranslations": {
    "en": {
      "key": "value",
      "key_with_pluralization": {
        "one": "one value",
        "many": "many value"
      },
      "key_with_html": "<em>Welcome</em>",
      "key_with_pluralization_and_html": {
        "one": "no html",
        "many": "<div>MANY!</div>"
      }
    },
    "sv": {
      "key": "värde",
      "key_with_pluralization": {
        "one": "1 värde"
      },
      "key_with_html": "<em>Welcome</em>",
      "key_with_pluralization_and_html": {
        "one": "no html",
        "many": "<div>MANY!</div>"
      }
    }
  }
}
```

And with those translations this function component...

```javascript
import Translate from "components/translate";

const C = props => (
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
```

is transformed to this code:

```javascript
import { withNamespaces } from "react-i18next";
import safeT from "lib/safeT";

const C = ({ t, ...props }) => (
  <div>
    {t("key")}
    {t("key_with_pluralization", {
      count: props.totalVisitors,
      totalViews: numeral(props.totalVisitors).format("0,0")
    })}
    {safeT(
      t("key_with_html", {
        count: props.totalVisitors,
        totalViews: numeral(props.totalVisitors).format("0,0")
      })
    )}
    {safeT(
      t("key_with_pluralization_and_html", {
        count: props.totalVisitors,
        totalViews: numeral(props.totalVisitors).format("0,0")
      })
    )}
  </div>
);

export default withNamespaces()(C);
```

and this Class component...

```javascript
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
```

Will be transformed to this:

```javascript
import { withNamespaces } from "react-i18next";
import safeT from "lib/safeT";
import { Component } from "react";

class C extends Component {
  render() {
    const { t, totalVisitors, copied } = this.props;
    return (
      <div>
        {t("key")}
        {t("key_with_pluralization", {
          count: totalVisitors,
          totalViews: numeral(totalVisitors).format("0,0")
        })}
        {safeT(
          t("key_with_html", {
            count: totalVisitors,
            totalViews: numeral(totalVisitors).format("0,0")
          })
        )}
        {safeT(
          t("key_with_pluralization_and_html", {
            count: totalVisitors,
            totalViews: numeral(totalVisitors).format("0,0")
          })
        )}
        {copied ? t("key") : null}
        {t("key")}
      </div>
    );
  }
}

export default withNamespaces()(C);
```
