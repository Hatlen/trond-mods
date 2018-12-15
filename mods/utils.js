export const looksLike = (node, wantedNode) =>
  node &&
  wantedNode &&
  Object.keys(wantedNode).every(key => {
    const nodeValue = node[key];
    const wantedNodeValue = wantedNode[key];
    if (typeof wantedNodeValue === "function") {
      return wantedNodeValue(nodeValue);
    }
    return primitive(wantedNode)
      ? nodeValue === wantedNodeValue
      : looksLike(nodeValue, wantedNodeValue);
  });

const primitive = value =>
  value == null || (typeof value).match(/^(string|number|boolean)/);
