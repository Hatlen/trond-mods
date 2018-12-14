# trond-mods

This repository contains a random collection of codemod scripts for use with
[codemod (babel)](https://github.com/codemod-js/codemod)

## Exchange react-i18next translate for withNamespaces

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
