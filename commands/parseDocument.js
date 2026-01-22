export default (text) => {
  const yamlMatch = text.match(/(^---\n([\s\S]*?)\n---\n)/);
  const yamlContent = yamlMatch ? yamlMatch[1] : "";
  const blockContentStart = yamlMatch ? yamlMatch[0].length : 0;
  const blockContent = text.substring(blockContentStart);
  const blocks =
    blockContent.length > 0
      ? blockContent.replace(/\n{3,}/g, "\n\n").split(/\n\n/)
      : [];
  return { yamlContent, blockContent, blocks };
};
