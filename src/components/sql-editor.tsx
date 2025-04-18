import { useThemeContext } from '@/contexts/theme';
import { createEffect, createSignal, mergeProps, onMount, VoidProps } from 'solid-js';

// CodeMirror imports
import { useVimModeContext } from '@/contexts/vim-mode';
import { sql as langSql } from '@codemirror/lang-sql';
import { Compartment, EditorState, RangeSetBuilder } from '@codemirror/state';
import {
  Decoration,
  DecorationSet,
  EditorView,
  GutterMarker,
  keymap,
  ViewPlugin,
  ViewUpdate,
} from '@codemirror/view';
import { vim } from '@replit/codemirror-vim';
import { basicSetup } from 'codemirror';

const selectedLineGutterHighlight = Decoration.line({
  attributes: { class: 'cm-selected-line-gutter' },
});

// Marker Class to add presence in the gutter for selected lines
class SelectedGutterMarker extends GutterMarker {
  elementClass = 'cm-selected-gutter-marker'; // Class for the marker itself
  toDOM() {
    return document.createElement('span');
  } // Empty span is sufficient
}
const selectedGutterPresenceMarker = new SelectedGutterMarker(); // Create one instance

function highlightSelectionPlugin() {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.computeDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = this.computeDecorations(update.view);
        }
      }

      computeDecorations(view: EditorView): DecorationSet {
        let builder = new RangeSetBuilder<Decoration>();
        let selection = view.state.selection.main;

        if (!selection.empty) {
          const fromLine = view.state.doc.lineAt(selection.from).number;
          const toLine = view.state.doc.lineAt(selection.to).number;
          for (let i = fromLine; i <= toLine; i++) {
            const lineStart = view.state.doc.line(i).from;
            builder.add(lineStart, lineStart, selectedLineGutterHighlight);

            // const line = view.state.doc.line(i);
            // builder.add(line.from, line.from, selectedGutterPresenceMarker);
          }
        }
        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
}

type SQLEditorProps = {};

export default function SQLEditor(props: VoidProps<SQLEditorProps>) {
  const defaultProps = mergeProps({}, props);

  // Context
  const { inferredTheme } = useThemeContext();
  const { vimModeEnabled } = useVimModeContext();

  // References
  let codeEditorContainer: HTMLDivElement | undefined;
  let codeEditorView: EditorView | undefined;
  let themeCompartment = new Compartment();
  let vimModeCompartment = new Compartment();

  // States
  const [selectedLinesInfo, setSelectedLinesInfo] = createSignal<{
    fromLine: number;
    toLine: number;
  } | null>(null);

  const [extractedSelection, setExtractedSelection] = createSignal<string | null>(null);

  const createThemeExtension = (isDark: boolean) => {
    return [
      EditorView.theme(
        {
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },

          // Custom selector we added for 'selected lines'
          '.cm-selected-line-gutter': {
            backgroundColor: 'rgba(255,255,0,0.1)',
            // color: 'white',
          },
          '.cm-activeLineGutter': {
            color: 'green',
          },
        },
        { dark: isDark }
      ),
      highlightSelectionPlugin(),
    ];
  };

  const handleEnter = (view: EditorView): boolean => {
    const state = view.state;
    const selection = state.selection.main;
    if (!selection.empty) {
      const fromLine = state.doc.lineAt(selection.from);
      const toLine = state.doc.lineAt(selection.to);
      let text = '';
      for (let i = fromLine.number; i <= toLine.number; i++) {
        text += state.doc.line(i).text + (i === toLine.number ? '' : '\n');
      }
      setExtractedSelection(text);
      console.log('Extracted Text on Enter:', text);
      return false;
    }
    return false;
  };

  onMount(() => {
    if (typeof window === 'undefined' || !codeEditorContainer) {
      return;
    }

    codeEditorView = new EditorView({
      state: EditorState.create({
        doc: "-- Your SQL query goes here...\nSELECT\n    id,\n    name\nFROM\n    users\nWHERE\n    status = 'active';",
        extensions: [
          basicSetup,
          langSql(),
          vimModeCompartment.of(vimModeEnabled() ? vim() : []),
          themeCompartment.of(createThemeExtension(inferredTheme() === 'dark')),

          // Attach listener for selecting.
          EditorView.updateListener.of((update) => {
            if (update.selectionSet && !update.state.selection.main.empty) {
              const selection = update.state.selection.main;

              const fromLine = update.state.doc.lineAt(selection.from).number;
              const toLine = update.state.doc.lineAt(selection.to).number;

              setSelectedLinesInfo({ fromLine, toLine });
            } else if (update.selectionSet && update.state.selection.main.empty) {
              setSelectedLinesInfo(null);
            }
          }),

          // Attach listener for custom hotkeys
          keymap.of([{ key: 'a', run: handleEnter }]),
        ],
      }),
      parent: codeEditorContainer,
    });
  });

  createEffect(() => {
    console.log('Selected Lines Info:', selectedLinesInfo());
  });

  // Effect for Theme changes.
  createEffect(() => {
    if (codeEditorView) {
      codeEditorView.dispatch({
        effects: themeCompartment.reconfigure(createThemeExtension(inferredTheme() === 'dark')),
      });
    }
  });

  // Effect for Vim Mode changes.
  createEffect(() => {
    if (!codeEditorView) return;
    codeEditorView.dispatch({
      effects: vimModeCompartment.reconfigure(vimModeEnabled() ? vim() : []),
    });
  });

  return <div ref={codeEditorContainer} class="h-full w-full"></div>;
}
