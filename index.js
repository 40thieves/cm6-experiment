import {
  EditorView,
  ViewPlugin,
  Decoration,
  WidgetType
} from '@codemirror/next/view'
import { EditorState } from '@codemirror/next/state'

import { history, undo, redo } from '@codemirror/next/history'

import { lineNumbers } from '@codemirror/next/gutter'

import { keymap } from '@codemirror/next/keymap'
import { baseKeymap } from '@codemirror/next/commands'

import { LezerSyntax } from '@codemirror/next/syntax'
import { styleTags, defaultHighlighter } from '@codemirror/next/highlight'
import { parser } from './latex'

const latexSyntax = new LezerSyntax(
  parser.withProps(
    styleTags({
      Command: 'keyword',
      'Options Arguments Math': 'string'
    })
  )
)

function latex() {
  return latexSyntax.extension
}

const insertMarkerDeco = Decoration.mark(2, 5, {
  attributes: { style: 'background: green' }
})

class DeleteMarkerWidget extends WidgetType {
  toDOM() {
    let dom = document.createElement('span')
    dom.style = 'border-left: 1px solid red'
    return dom
  }
}
const deleteMarkerDeco = Decoration.widget(8, {
  widget: new DeleteMarkerWidget('widget'),
  side: 1 // Typing immediately to the left will move it forward
})

const trackedChangesPlugin = ViewPlugin.decoration({
  create() {
    return Decoration.set([insertMarkerDeco, deleteMarkerDeco])
  },
  update(value) {
    return value
  },
  map: true
})

const state = EditorState.create({
  doc: `this is some \\foo{normal} text`,
  extensions: [
    latex(),
    defaultHighlighter,
    trackedChangesPlugin,
    lineNumbers(),
    history(),
    keymap({
      'Mod-z': undo,
      'Mod-Shift-z': redo
    }),
    keymap(baseKeymap)
  ]
})

const view = new EditorView({ state })

document.body.append(view.dom)
