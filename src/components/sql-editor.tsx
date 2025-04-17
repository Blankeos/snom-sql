import { mergeProps, onMount, VoidProps } from 'solid-js';

// CodeMirror imports
import { sql as langSql } from '@codemirror/lang-sql';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { useThemeContext } from '@/contexts/theme';

type SQLEditorProps = {};

export default function SQLEditor(props: VoidProps<SQLEditorProps>) {
  const defaultProps = mergeProps({}, props);
  
  const { theme } = useThemeContext();

  let codeEditorContainer: HTMLDivElement | undefined;

  let codeEditorView: EditorView | undefined;

  onMount(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!codeEditorContainer) return;

    codeEditorView = new EditorView({
      state: EditorState.create({
        doc: "-- Your SQL query goes here...\nSELECT\n    id,\n    name\nFROM\n    users\nWHERE\n    status = 'active';",
        extensions: [
          basicSetup,
          langSql(),
          EditorView.theme({}, { dark: theme() === 'dark' }),
          // EditorView.theme({
          //   '&': {
          //     height: '100%',
          //     fontSize: '12px',
          //   },
          //   '.cm-content': {
          //     fontFamily: 'monospace',
          //     // caretColor: isDark ? '#fff' : '#000',
          //   },
          //   '.cm-gutters': {
          //     // backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
          //     // color: isDark ? '#9ca3af' : '#6b7280',
          //     border: 'none',
          //   },
          //   '.cm-scroller': {
          //     overflow: 'auto',
          //     height: '100%',
          //   },
          //   '.cm-line': {
          //     padding: '0 4px',
          //   },
          //   '&.cm-focused .cm-cursor': {
          //     // borderLeftColor: isDark ? '#fff' : '#000',
          //   },
          //   '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
          //     {
          //       // backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          //     },
          //   '.cm-activeLine': {
          //     // backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          //   },
          // }),
          // EditorView.updateListener.of((update) => {
          //   if (update.docChanged) {
          //     const newValue = update.state.doc.toString();
          //     setVSCodeSnippet(newValue);
          //     debouncedConvert(newValue);
          //   }
          // }),
        ],
      }),
      parent: codeEditorContainer,
    });
  });

  return <div ref={codeEditorContainer} class="h-full w-full"></div>;
}
