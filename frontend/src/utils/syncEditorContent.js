export const syncEditorContent = (editor, content) => {
  console.log('syncing content with editor:', content);
  editor.setContents([
    { insert: content },
    { insert: '\n' },
  ]);
};
