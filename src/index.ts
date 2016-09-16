import { Directive, EventEmitter, Output, ElementRef, Input } from '@angular/core';
import 'brace';
import 'brace/theme/chrome';
import 'brace/mode/html';

declare var ace:any;

@Directive({
  selector: '[ace-editor]'
})
export class AceEditorDirective {
  @Output('textChanged') textChanged = new EventEmitter();
  _options:any = {};
  _readOnly:boolean = false;
  _theme:string = "chrome";
  _mode:string = "html";
  _autoUpdateContent:boolean = true;
  editor:any;
  oldText:any;

  constructor(elementRef: ElementRef) {
    let el = elementRef.nativeElement;
    this.editor = ace["edit"](el);

    this.init();
    this.initEvents();
  }

  init() {
    this.editor.setOptions(this._options || {});
    this.editor.$blockScrolling = Infinity;
    this.editor.setTheme(`ace/theme/${this._theme}`);
    this.editor.getSession().setMode(`ace/mode/${this._mode}`);
    this.editor.setReadOnly(this._readOnly);
    this.editor.container.style.lineHeight = 1;
    let session = this.editor.getSession();
    session.on('changeAnnotation', () => {
      let annotations = session.getAnnotations()||[];
      let len = annotations.length;
      let i = len;
      while (i--) {
        if(/doctype first\. Expected/.test(annotations[i].text)) {
          annotations.splice(i, 1);
        }
      }
      if(len>annotations.length) {
        session.setAnnotations(annotations);
      }
    });
  }

  initEvents() {
    this.editor.on('change', () => {
      let newVal = this.editor.getValue();
      if(newVal === this.oldText) return;
      if(typeof this.oldText !== 'undefined')
        this.textChanged.emit(newVal);
      this.oldText = newVal;
    });
  }

  @Input() set options(options) {
    this._options = options;
    this.editor.setOptions(options || {});
  }

  @Input() set readOnly(readOnly) {
    this._readOnly = readOnly;
    this.editor.setReadOnly(readOnly);
  }

  @Input() set theme(theme) {
    this._theme = theme;
    this.editor.setTheme(`ace/theme/${theme}`);
  }

  @Input() set mode(mode) {
    this._mode = mode;
    this.editor.getSession().setMode(`ace/mode/${mode}`);
  }

  @Input() set text(text) {
      if(text == null)
          text = "";

      if(this._autoUpdateContent == true) {
          this.editor.setValue(text);
          this.editor.clearSelection();
          this.editor.focus();
      }
  }

  @Input() set autoUpdateContent(status) {
      this._autoUpdateContent = status;
  }
}
