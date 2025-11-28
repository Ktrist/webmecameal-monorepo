export default ({ env }: { env: any }) => ({
  ckeditor: {
    enabled: true,
    config: {
      editor: {
        toolbar: [
          'heading', '|', 
          'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 
          'outdent', 'indent', '|',
          'blockQuote', 'insertTable', 'mediaEmbed', 
          '|', 'undo', 'redo',
          'codeBlock', 'code' 
        ],
      },
    }
  },
});