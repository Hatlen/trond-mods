export const looksLike = (node, wantedNode) =>
  node &&
  wantedNode &&
  Object.keys(wantedNode).every(key => {
    const nodeValue = node[key];
    const wantedNodeValue = wantedNode[key];
    if (typeof wantedNodeValue === "function") {
      return wantedNodeValue(nodeValue);
    }
    return primitive(wantedNodeValue)
      ? nodeValue === wantedNodeValue
      : looksLike(nodeValue, wantedNodeValue);
  });

const primitive = value =>
  value == null || /^(string|number|boolean)/.test(typeof value);
