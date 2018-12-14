import { translate } from "react-i18next";

const SmallComponent = ({ t }) => <div>{t("translation_key")}</div>;

export default translate()(SmallComponent);
