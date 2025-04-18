import { useThemeContext } from '@/contexts/theme';
import { createEffect, mergeProps, onMount, VoidProps } from 'solid-js';

// CodeMirror imports
import { useVimModeContext } from '@/contexts/vim-mode';
import { sql as langSql } from '@codemirror/lang-sql';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';

type SQLEditorProps = {};

export default function SQLEditor(props: VoidProps<SQLEditorProps>) {
  const defaultProps = mergeProps({}, props);

  const { inferredTheme } = useThemeContext();
  const { vimModeEnabled } = useVimModeContext();

  let codeEditorContainer: HTMLDivElement | undefined;

  let codeEditorView: EditorView | undefined;

  let themeCompartment = new Compartment();
  let vimModeCompartment = new Compartment();

  const createThemeExtension = (isDark: boolean) => {
    return EditorView.theme(
      {
        '&': {
          // Styles the main editor element (.cm-editor)
          height: '100%',
        },
        '.cm-scroller': {
          // Styles the scrolling element
          overflow: 'auto',
          // height: '100%', // Often not needed if '&' height is set, but can be added if gutter issues persist
        },
        // '.cm-gutters': { // Direct gutter styling (usually inherits height correctly)
        //   height: '100%',
        // }
      },
      { dark: isDark }
    );
  };

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
          vimModeCompartment.of(vimModeEnabled() ? vim() : []),
          themeCompartment.of(createThemeExtension(inferredTheme() === 'dark')),
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

  createEffect(() => {
    if (codeEditorView) {
      codeEditorView.dispatch({
        effects: themeCompartment.reconfigure(createThemeExtension(inferredTheme() === 'dark')),
      });
    }
  });

  createEffect(() => {
    if (!codeEditorView) return;
    
    codeEditorView.dispatch({
      effects: vimModeCompartment.reconfigure(vimModeEnabled() ? vim() : []),
    })
  });
  return <div ref={codeEditorContainer} class="h-full w-full"></div>;
}
