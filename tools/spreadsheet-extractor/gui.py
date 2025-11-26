#!/usr/bin/env python3
"""
Spreadsheet Business Logic Extractor - GUI Application
A point-and-click tool for extracting business logic from Excel spreadsheets.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
from pathlib import Path
from typing import Optional, List
import webbrowser

from analyzer import (
    SpreadsheetAnalyzer, AnalysisResult, SpreadsheetEditor,
    FormulaChange, EditResult
)
from prompts import (
    PROMPT_LIBRARY, get_prompt_by_id, generate_contextual_prompt,
    generate_contextual_prompts, export_analysis_markdown, Prompt
)


class SpreadsheetExtractorApp:
    """Main application class for the Spreadsheet Extractor GUI."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Spreadsheet Business Logic Extractor")
        self.root.geometry("1200x800")
        self.root.minsize(900, 600)

        # State
        self.current_file: Optional[Path] = None
        self.analysis: Optional[AnalysisResult] = None
        self.selected_prompt: Optional[Prompt] = None
        self.pending_changes: List[FormulaChange] = []
        self.editor: Optional[SpreadsheetEditor] = None

        # Configure styles
        self._setup_styles()

        # Build UI
        self._create_menu()
        self._create_main_layout()

        # Keyboard shortcuts
        self.root.bind('<Control-o>', lambda e: self._open_file())
        self.root.bind('<Control-e>', lambda e: self._export_markdown())
        self.root.bind('<Control-c>', lambda e: self._copy_to_clipboard())

    def _setup_styles(self):
        """Configure ttk styles."""
        style = ttk.Style()
        style.theme_use('clam')

        # Custom styles
        style.configure('Header.TLabel', font=('Helvetica', 14, 'bold'))
        style.configure('Subheader.TLabel', font=('Helvetica', 11, 'bold'))
        style.configure('Status.TLabel', font=('Helvetica', 10))
        style.configure('Accent.TButton', font=('Helvetica', 10, 'bold'))

    def _create_menu(self):
        """Create the menu bar."""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)

        # File menu
        file_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="File", menu=file_menu)
        file_menu.add_command(label="Open Spreadsheet...", command=self._open_file, accelerator="Ctrl+O")
        file_menu.add_separator()
        file_menu.add_command(label="Export Analysis...", command=self._export_markdown, accelerator="Ctrl+E")
        file_menu.add_separator()
        file_menu.add_command(label="Exit", command=self.root.quit)

        # Edit menu
        edit_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Edit", menu=edit_menu)
        edit_menu.add_command(label="Copy Prompt", command=self._copy_to_clipboard, accelerator="Ctrl+C")

        # Help menu
        help_menu = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Help", menu=help_menu)
        help_menu.add_command(label="About", command=self._show_about)

    def _create_main_layout(self):
        """Create the main application layout."""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Top section - File selection
        self._create_file_section(main_frame)

        # Create notebook for tabs
        self.notebook = ttk.Notebook(main_frame)
        self.notebook.pack(fill=tk.BOTH, expand=True, pady=(10, 0))

        # Tab 1: Analysis
        self.analysis_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.analysis_frame, text="Analysis")
        self._create_analysis_tab(self.analysis_frame)

        # Tab 2: Prompt Library
        self.prompts_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.prompts_frame, text="Prompt Library")
        self._create_prompts_tab(self.prompts_frame)

        # Tab 3: Generated Prompt
        self.output_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.output_frame, text="Generated Prompt")
        self._create_output_tab(self.output_frame)

        # Tab 4: Formula Editor
        self.editor_frame = ttk.Frame(self.notebook, padding="10")
        self.notebook.add(self.editor_frame, text="Formula Editor")
        self._create_editor_tab(self.editor_frame)

        # Status bar
        self.status_var = tk.StringVar(value="Ready. Open a spreadsheet to begin.")
        status_bar = ttk.Label(main_frame, textvariable=self.status_var, style='Status.TLabel')
        status_bar.pack(fill=tk.X, pady=(10, 0))

    def _create_file_section(self, parent):
        """Create the file selection section."""
        file_frame = ttk.LabelFrame(parent, text="Spreadsheet File", padding="10")
        file_frame.pack(fill=tk.X)

        # File path display
        self.file_var = tk.StringVar(value="No file selected")
        file_label = ttk.Label(file_frame, textvariable=self.file_var, font=('Helvetica', 10))
        file_label.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # Buttons
        btn_frame = ttk.Frame(file_frame)
        btn_frame.pack(side=tk.RIGHT)

        open_btn = ttk.Button(btn_frame, text="Open File...", command=self._open_file, style='Accent.TButton')
        open_btn.pack(side=tk.LEFT, padx=(0, 5))

        self.analyze_btn = ttk.Button(btn_frame, text="Re-Analyze", command=self._analyze_file, state=tk.DISABLED)
        self.analyze_btn.pack(side=tk.LEFT)

    def _create_analysis_tab(self, parent):
        """Create the analysis tab content."""
        # Summary section
        summary_frame = ttk.LabelFrame(parent, text="Summary", padding="10")
        summary_frame.pack(fill=tk.X)

        # Summary grid
        self.summary_labels = {}
        summary_items = [
            ("file_size", "File Size:"),
            ("sheets", "Sheets:"),
            ("formulas", "Formulas:"),
            ("named_ranges", "Named Ranges:"),
            ("tables", "Tables:"),
            ("complexity", "Complexity:"),
        ]

        for i, (key, label) in enumerate(summary_items):
            row, col = divmod(i, 3)
            lbl = ttk.Label(summary_frame, text=label)
            lbl.grid(row=row, column=col*2, sticky=tk.W, padx=(10, 5))
            val = ttk.Label(summary_frame, text="-", font=('Helvetica', 10, 'bold'))
            val.grid(row=row, column=col*2+1, sticky=tk.W, padx=(0, 20))
            self.summary_labels[key] = val

        # Paned window for sheets and formulas
        paned = ttk.PanedWindow(parent, orient=tk.HORIZONTAL)
        paned.pack(fill=tk.BOTH, expand=True, pady=(10, 0))

        # Left: Sheets list
        sheets_frame = ttk.LabelFrame(paned, text="Sheets", padding="5")
        paned.add(sheets_frame, weight=1)

        self.sheets_tree = ttk.Treeview(sheets_frame, columns=("rows", "cols", "formulas"), show="headings", height=8)
        self.sheets_tree.heading("rows", text="Rows")
        self.sheets_tree.heading("cols", text="Cols")
        self.sheets_tree.heading("formulas", text="Formulas")
        self.sheets_tree.column("rows", width=60)
        self.sheets_tree.column("cols", width=60)
        self.sheets_tree.column("formulas", width=70)

        sheets_scroll = ttk.Scrollbar(sheets_frame, orient=tk.VERTICAL, command=self.sheets_tree.yview)
        self.sheets_tree.configure(yscrollcommand=sheets_scroll.set)

        self.sheets_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        sheets_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Right: Functions list
        funcs_frame = ttk.LabelFrame(paned, text="Excel Functions Used", padding="5")
        paned.add(funcs_frame, weight=1)

        self.funcs_tree = ttk.Treeview(funcs_frame, columns=("count",), show="headings", height=8)
        self.funcs_tree.heading("count", text="Count")
        self.funcs_tree.column("count", width=60)

        funcs_scroll = ttk.Scrollbar(funcs_frame, orient=tk.VERTICAL, command=self.funcs_tree.yview)
        self.funcs_tree.configure(yscrollcommand=funcs_scroll.set)

        self.funcs_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        funcs_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Bottom: Formulas list
        formulas_frame = ttk.LabelFrame(parent, text="Formulas", padding="5")
        formulas_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))

        # Search/filter
        filter_frame = ttk.Frame(formulas_frame)
        filter_frame.pack(fill=tk.X, pady=(0, 5))

        ttk.Label(filter_frame, text="Filter:").pack(side=tk.LEFT)
        self.formula_filter = tk.StringVar()
        self.formula_filter.trace('w', self._filter_formulas)
        filter_entry = ttk.Entry(filter_frame, textvariable=self.formula_filter, width=30)
        filter_entry.pack(side=tk.LEFT, padx=(5, 10))

        self.array_only = tk.BooleanVar()
        array_check = ttk.Checkbutton(filter_frame, text="Array formulas only", variable=self.array_only,
                                       command=self._filter_formulas)
        array_check.pack(side=tk.LEFT)

        # Formulas treeview
        self.formulas_tree = ttk.Treeview(formulas_frame,
                                           columns=("sheet", "formula", "functions"),
                                           show="headings", height=10)
        self.formulas_tree.heading("sheet", text="Location")
        self.formulas_tree.heading("formula", text="Formula")
        self.formulas_tree.heading("functions", text="Functions")
        self.formulas_tree.column("sheet", width=120)
        self.formulas_tree.column("formula", width=400)
        self.formulas_tree.column("functions", width=150)

        formulas_scroll = ttk.Scrollbar(formulas_frame, orient=tk.VERTICAL, command=self.formulas_tree.yview)
        self.formulas_tree.configure(yscrollcommand=formulas_scroll.set)

        self.formulas_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        formulas_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Bind double-click to copy formula
        self.formulas_tree.bind('<Double-1>', self._copy_formula)

    def _create_prompts_tab(self, parent):
        """Create the prompts library tab."""
        # Paned window
        paned = ttk.PanedWindow(parent, orient=tk.HORIZONTAL)
        paned.pack(fill=tk.BOTH, expand=True)

        # Left: Categories
        cat_frame = ttk.LabelFrame(paned, text="Categories", padding="5")
        paned.add(cat_frame, weight=1)

        self.category_list = tk.Listbox(cat_frame, height=15, font=('Helvetica', 10))
        self.category_list.pack(fill=tk.BOTH, expand=True)
        self.category_list.bind('<<ListboxSelect>>', self._on_category_select)

        # Populate categories
        self.category_ids = list(PROMPT_LIBRARY.keys())
        for cat_id in self.category_ids:
            self.category_list.insert(tk.END, PROMPT_LIBRARY[cat_id]["name"])

        # Middle: Prompts in category
        prompts_frame = ttk.LabelFrame(paned, text="Prompts", padding="5")
        paned.add(prompts_frame, weight=1)

        self.prompts_list = tk.Listbox(prompts_frame, height=15, font=('Helvetica', 10))
        self.prompts_list.pack(fill=tk.BOTH, expand=True)
        self.prompts_list.bind('<<ListboxSelect>>', self._on_prompt_select)

        # Right: Preview
        preview_frame = ttk.LabelFrame(paned, text="Prompt Preview", padding="5")
        paned.add(preview_frame, weight=2)

        self.preview_text = scrolledtext.ScrolledText(preview_frame, wrap=tk.WORD, font=('Consolas', 10), height=15)
        self.preview_text.pack(fill=tk.BOTH, expand=True)

        # Buttons
        btn_frame = ttk.Frame(preview_frame)
        btn_frame.pack(fill=tk.X, pady=(5, 0))

        generate_btn = ttk.Button(btn_frame, text="Generate with Context", command=self._generate_prompt)
        generate_btn.pack(side=tk.LEFT)

        copy_btn = ttk.Button(btn_frame, text="Copy to Clipboard", command=self._copy_preview)
        copy_btn.pack(side=tk.LEFT, padx=(5, 0))

        # Bottom: Contextual prompts
        ctx_frame = ttk.LabelFrame(parent, text="Contextual Prompts (based on analysis)", padding="5")
        ctx_frame.pack(fill=tk.X, pady=(10, 0))

        self.ctx_prompts_list = tk.Listbox(ctx_frame, height=5, font=('Helvetica', 10))
        self.ctx_prompts_list.pack(fill=tk.BOTH, expand=True)
        self.ctx_prompts_list.bind('<Double-1>', self._copy_contextual_prompt)

    def _create_output_tab(self, parent):
        """Create the output/generated prompt tab."""
        # Custom context input
        ctx_frame = ttk.LabelFrame(parent, text="Additional Context (optional)", padding="5")
        ctx_frame.pack(fill=tk.X)

        self.custom_context = scrolledtext.ScrolledText(ctx_frame, wrap=tk.WORD, font=('Consolas', 10), height=4)
        self.custom_context.pack(fill=tk.X)

        # Generated prompt output
        output_frame = ttk.LabelFrame(parent, text="Generated Prompt (ready to copy)", padding="5")
        output_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))

        self.output_text = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD, font=('Consolas', 11), height=20)
        self.output_text.pack(fill=tk.BOTH, expand=True)

        # Buttons
        btn_frame = ttk.Frame(output_frame)
        btn_frame.pack(fill=tk.X, pady=(5, 0))

        copy_btn = ttk.Button(btn_frame, text="Copy to Clipboard", command=self._copy_to_clipboard,
                              style='Accent.TButton')
        copy_btn.pack(side=tk.LEFT)

        clear_btn = ttk.Button(btn_frame, text="Clear", command=lambda: self.output_text.delete('1.0', tk.END))
        clear_btn.pack(side=tk.LEFT, padx=(5, 0))

    def _create_editor_tab(self, parent):
        """Create the formula editor tab for find/replace across sheets."""
        # Top section - Find/Replace controls
        controls_frame = ttk.LabelFrame(parent, text="Find & Replace Formulas", padding="10")
        controls_frame.pack(fill=tk.X)

        # Find row
        find_frame = ttk.Frame(controls_frame)
        find_frame.pack(fill=tk.X, pady=(0, 5))

        ttk.Label(find_frame, text="Find:", width=10).pack(side=tk.LEFT)
        self.find_var = tk.StringVar()
        self.find_entry = ttk.Entry(find_frame, textvariable=self.find_var, width=50)
        self.find_entry.pack(side=tk.LEFT, padx=(0, 10), fill=tk.X, expand=True)

        # Replace row
        replace_frame = ttk.Frame(controls_frame)
        replace_frame.pack(fill=tk.X, pady=(0, 5))

        ttk.Label(replace_frame, text="Replace:", width=10).pack(side=tk.LEFT)
        self.replace_var = tk.StringVar()
        self.replace_entry = ttk.Entry(replace_frame, textvariable=self.replace_var, width=50)
        self.replace_entry.pack(side=tk.LEFT, padx=(0, 10), fill=tk.X, expand=True)

        # Options row
        options_frame = ttk.Frame(controls_frame)
        options_frame.pack(fill=tk.X, pady=(0, 10))

        self.case_sensitive_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(options_frame, text="Case sensitive", variable=self.case_sensitive_var).pack(side=tk.LEFT, padx=(0, 15))

        self.use_regex_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(options_frame, text="Use regex", variable=self.use_regex_var).pack(side=tk.LEFT, padx=(0, 15))

        self.create_backup_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(options_frame, text="Create backup", variable=self.create_backup_var).pack(side=tk.LEFT, padx=(0, 15))

        # Sheet filter
        ttk.Label(options_frame, text="Sheets:").pack(side=tk.LEFT, padx=(20, 5))
        self.sheet_filter_var = tk.StringVar(value="All sheets")
        self.sheet_filter_combo = ttk.Combobox(options_frame, textvariable=self.sheet_filter_var, width=20, state='readonly')
        self.sheet_filter_combo['values'] = ['All sheets']
        self.sheet_filter_combo.pack(side=tk.LEFT)

        # Buttons row
        btn_frame = ttk.Frame(controls_frame)
        btn_frame.pack(fill=tk.X)

        preview_btn = ttk.Button(btn_frame, text="Preview Changes", command=self._preview_changes, style='Accent.TButton')
        preview_btn.pack(side=tk.LEFT, padx=(0, 5))

        apply_btn = ttk.Button(btn_frame, text="Apply Changes", command=self._apply_changes)
        apply_btn.pack(side=tk.LEFT, padx=(0, 5))

        clear_btn = ttk.Button(btn_frame, text="Clear Preview", command=self._clear_preview)
        clear_btn.pack(side=tk.LEFT, padx=(0, 20))

        # Quick actions
        ttk.Separator(btn_frame, orient=tk.VERTICAL).pack(side=tk.LEFT, fill=tk.Y, padx=10)
        ttk.Label(btn_frame, text="Quick:").pack(side=tk.LEFT, padx=(0, 5))

        rename_sheet_btn = ttk.Button(btn_frame, text="Rename Sheet Refs...", command=self._rename_sheet_refs)
        rename_sheet_btn.pack(side=tk.LEFT, padx=(0, 5))

        # Preview section
        preview_frame = ttk.LabelFrame(parent, text="Preview Changes (0 formulas will be modified)", padding="5")
        preview_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        self.preview_label_frame = preview_frame

        # Changes treeview
        columns = ("sheet", "address", "old_formula", "new_formula")
        self.changes_tree = ttk.Treeview(preview_frame, columns=columns, show="headings", height=15)
        self.changes_tree.heading("sheet", text="Sheet")
        self.changes_tree.heading("address", text="Cell")
        self.changes_tree.heading("old_formula", text="Original Formula")
        self.changes_tree.heading("new_formula", text="New Formula")
        self.changes_tree.column("sheet", width=100)
        self.changes_tree.column("address", width=60)
        self.changes_tree.column("old_formula", width=300)
        self.changes_tree.column("new_formula", width=300)

        # Add scrollbars
        y_scroll = ttk.Scrollbar(preview_frame, orient=tk.VERTICAL, command=self.changes_tree.yview)
        x_scroll = ttk.Scrollbar(preview_frame, orient=tk.HORIZONTAL, command=self.changes_tree.xview)
        self.changes_tree.configure(yscrollcommand=y_scroll.set, xscrollcommand=x_scroll.set)

        self.changes_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        y_scroll.pack(side=tk.RIGHT, fill=tk.Y)

        # Tag for highlighting differences
        self.changes_tree.tag_configure('changed', background='#ffffcc')

        # Output/save options
        save_frame = ttk.LabelFrame(parent, text="Save Options", padding="5")
        save_frame.pack(fill=tk.X, pady=(10, 0))

        self.save_as_new_var = tk.BooleanVar(value=False)
        ttk.Checkbutton(save_frame, text="Save as new file", variable=self.save_as_new_var).pack(side=tk.LEFT, padx=(0, 15))

        ttk.Label(save_frame, text="Output path:").pack(side=tk.LEFT, padx=(0, 5))
        self.output_path_var = tk.StringVar(value="")
        self.output_path_entry = ttk.Entry(save_frame, textvariable=self.output_path_var, width=40)
        self.output_path_entry.pack(side=tk.LEFT, padx=(0, 5), fill=tk.X, expand=True)

        browse_btn = ttk.Button(save_frame, text="Browse...", command=self._browse_output_path)
        browse_btn.pack(side=tk.LEFT)

    # ========================================================================
    # Formula Editor Actions
    # ========================================================================

    def _preview_changes(self):
        """Preview formula changes without applying them."""
        if not self.current_file:
            messagebox.showwarning("No File", "Please open a spreadsheet first.")
            return

        find_text = self.find_var.get()
        if not find_text:
            messagebox.showwarning("Empty Search", "Please enter text to find.")
            return

        replace_text = self.replace_var.get()
        case_sensitive = self.case_sensitive_var.get()
        use_regex = self.use_regex_var.get()

        # Get selected sheets
        sheets = None
        if self.sheet_filter_var.get() != "All sheets":
            sheets = [self.sheet_filter_var.get()]

        self.status_var.set("Previewing changes...")
        self.root.update()

        try:
            # Close existing editor if any
            if self.editor:
                self.editor.close()

            self.editor = SpreadsheetEditor(str(self.current_file))
            self.pending_changes = self.editor.preview_replace(
                find_text, replace_text, case_sensitive, use_regex, sheets
            )

            # Update the preview treeview
            self._update_changes_preview()

            if not self.pending_changes:
                self.status_var.set("No matching formulas found.")
            else:
                self.status_var.set(f"Found {len(self.pending_changes)} formulas to modify. Review and click 'Apply Changes'.")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to preview changes: {str(e)}")
            self.status_var.set("Preview failed.")

    def _update_changes_preview(self):
        """Update the changes preview treeview."""
        # Clear existing items
        self.changes_tree.delete(*self.changes_tree.get_children())

        # Update frame label
        count = len(self.pending_changes)
        self.preview_label_frame.config(text=f"Preview Changes ({count} formulas will be modified)")

        # Add changes to tree
        for change in self.pending_changes:
            old_display = change.old_formula[:60] + "..." if len(change.old_formula) > 60 else change.old_formula
            new_display = change.new_formula[:60] + "..." if len(change.new_formula) > 60 else change.new_formula

            self.changes_tree.insert("", tk.END, values=(
                change.sheet,
                change.address,
                f"={old_display}",
                f"={new_display}"
            ), tags=('changed',))

    def _apply_changes(self):
        """Apply the pending formula changes."""
        if not self.pending_changes:
            messagebox.showwarning("No Changes", "No changes to apply. Run 'Preview Changes' first.")
            return

        if not self.editor:
            messagebox.showerror("Error", "Editor not initialized. Please preview changes first.")
            return

        # Confirm
        count = len(self.pending_changes)
        if not messagebox.askyesno("Confirm Changes",
                                    f"This will modify {count} formulas.\n\n"
                                    f"{'A backup will be created.' if self.create_backup_var.get() else 'NO BACKUP will be created!'}\n\n"
                                    "Continue?"):
            return

        self.status_var.set("Applying changes...")
        self.root.update()

        try:
            # Determine output path
            output_path = None
            if self.save_as_new_var.get() and self.output_path_var.get():
                output_path = self.output_path_var.get()

            # Apply changes
            result = self.editor.apply_changes(self.pending_changes, self.create_backup_var.get())

            # Save
            if result.changes_made > 0:
                saved_path = self.editor.save(output_path)

                # Show result
                msg = f"Successfully modified {result.changes_made} formulas.\n\nSaved to: {saved_path}"
                if result.backup_path:
                    msg += f"\n\nBackup created: {result.backup_path}"

                messagebox.showinfo("Changes Applied", msg)
                self.status_var.set(f"Applied {result.changes_made} changes. Saved to {saved_path}")

                # Clear preview and reload
                self._clear_preview()
                self._analyze_file()  # Re-analyze to show updated formulas
            else:
                messagebox.showwarning("No Changes", "No changes were applied.")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to apply changes: {str(e)}")
            self.status_var.set("Apply failed.")

    def _clear_preview(self):
        """Clear the changes preview."""
        self.pending_changes = []
        self.changes_tree.delete(*self.changes_tree.get_children())
        self.preview_label_frame.config(text="Preview Changes (0 formulas will be modified)")
        self.status_var.set("Preview cleared.")

        if self.editor:
            self.editor.close()
            self.editor = None

    def _rename_sheet_refs(self):
        """Quick action to rename sheet references."""
        if not self.current_file:
            messagebox.showwarning("No File", "Please open a spreadsheet first.")
            return

        # Create a dialog
        dialog = tk.Toplevel(self.root)
        dialog.title("Rename Sheet References")
        dialog.geometry("400x150")
        dialog.transient(self.root)
        dialog.grab_set()

        ttk.Label(dialog, text="Old sheet name:").pack(anchor=tk.W, padx=10, pady=(10, 0))
        old_name_var = tk.StringVar()
        old_entry = ttk.Entry(dialog, textvariable=old_name_var, width=40)
        old_entry.pack(padx=10, pady=(0, 10))

        ttk.Label(dialog, text="New sheet name:").pack(anchor=tk.W, padx=10)
        new_name_var = tk.StringVar()
        new_entry = ttk.Entry(dialog, textvariable=new_name_var, width=40)
        new_entry.pack(padx=10, pady=(0, 10))

        def do_rename():
            old_name = old_name_var.get().strip()
            new_name = new_name_var.get().strip()

            if not old_name or not new_name:
                messagebox.showwarning("Missing Input", "Please enter both old and new sheet names.")
                return

            # Set up find/replace
            self.find_var.set(f"'{old_name}'!")
            self.replace_var.set(f"'{new_name}'!")
            self.case_sensitive_var.set(True)

            dialog.destroy()

            # Preview changes
            self._preview_changes()

        btn_frame = ttk.Frame(dialog)
        btn_frame.pack(pady=10)
        ttk.Button(btn_frame, text="Preview Changes", command=do_rename).pack(side=tk.LEFT, padx=5)
        ttk.Button(btn_frame, text="Cancel", command=dialog.destroy).pack(side=tk.LEFT)

    def _browse_output_path(self):
        """Browse for output file path."""
        if not self.current_file:
            return

        default_name = self.current_file.stem + "_modified" + self.current_file.suffix
        filepath = filedialog.asksaveasfilename(
            title="Save Modified Spreadsheet",
            defaultextension=self.current_file.suffix,
            filetypes=[("Excel files", "*.xlsx *.xlsm"), ("All files", "*.*")],
            initialfile=default_name
        )

        if filepath:
            self.output_path_var.set(filepath)
            self.save_as_new_var.set(True)

    # ========================================================================
    # Actions
    # ========================================================================

    def _open_file(self):
        """Open file dialog to select a spreadsheet."""
        filetypes = [
            ("Excel files", "*.xlsx *.xls *.xlsm *.xlsb"),
            ("CSV files", "*.csv"),
            ("All files", "*.*")
        ]

        filepath = filedialog.askopenfilename(
            title="Select Spreadsheet",
            filetypes=filetypes
        )

        if filepath:
            self.current_file = Path(filepath)
            self.file_var.set(str(self.current_file))
            self._analyze_file()

    def _analyze_file(self):
        """Analyze the current file."""
        if not self.current_file:
            return

        self.status_var.set(f"Analyzing {self.current_file.name}...")
        self.root.update()

        # Run analysis in thread to keep UI responsive
        def analyze():
            analyzer = SpreadsheetAnalyzer()
            self.analysis = analyzer.analyze(str(self.current_file))

            # Update UI in main thread
            self.root.after(0, self._update_analysis_display)

        thread = threading.Thread(target=analyze)
        thread.start()

    def _update_analysis_display(self):
        """Update the UI with analysis results."""
        if not self.analysis:
            return

        a = self.analysis

        # Update summary
        self.summary_labels["file_size"].config(text=f"{a.file_size / 1024:.2f} KB")
        self.summary_labels["sheets"].config(text=str(len(a.sheets)))
        self.summary_labels["formulas"].config(text=str(len(a.formulas)))
        self.summary_labels["named_ranges"].config(text=str(len(a.named_ranges)))
        self.summary_labels["tables"].config(text=str(len(a.tables)))

        complexity_colors = {
            "simple": "green",
            "moderate": "orange",
            "complex": "red",
            "very-complex": "darkred"
        }
        self.summary_labels["complexity"].config(
            text=a.complexity.upper(),
            foreground=complexity_colors.get(a.complexity, "black")
        )

        # Update sheets list
        self.sheets_tree.delete(*self.sheets_tree.get_children())
        for sheet in a.sheets:
            self.sheets_tree.insert("", tk.END, text=sheet.name,
                                     values=(sheet.row_count, sheet.column_count, sheet.formula_count))

        # Update functions list
        self.funcs_tree.delete(*self.funcs_tree.get_children())
        for func, count in sorted(a.function_stats.items(), key=lambda x: -x[1]):
            self.funcs_tree.insert("", tk.END, text=func, values=(count,))

        # Update formulas list
        self._populate_formulas()

        # Update contextual prompts
        self.ctx_prompts_list.delete(0, tk.END)
        ctx_prompts = generate_contextual_prompts(a)
        for prompt in ctx_prompts:
            self.ctx_prompts_list.insert(tk.END, prompt[:100] + "..." if len(prompt) > 100 else prompt)
        self._contextual_prompts = ctx_prompts

        # Enable re-analyze button
        self.analyze_btn.config(state=tk.NORMAL)

        # Update sheet filter in editor tab
        sheet_names = ['All sheets'] + [s.name for s in a.sheets]
        self.sheet_filter_combo['values'] = sheet_names

        # Update status
        if a.errors:
            self.status_var.set(f"Analysis complete with warnings: {a.errors[0]}")
        else:
            self.status_var.set(f"Analysis complete: {len(a.formulas)} formulas found")

    def _populate_formulas(self):
        """Populate the formulas tree with optional filtering."""
        self.formulas_tree.delete(*self.formulas_tree.get_children())

        if not self.analysis:
            return

        filter_text = self.formula_filter.get().upper()
        array_only = self.array_only.get()

        for formula in self.analysis.formulas:
            # Apply filters
            if array_only and not formula.is_array_formula:
                continue
            if filter_text and filter_text not in formula.formula.upper():
                continue

            location = f"{formula.sheet}!{formula.address}"
            funcs = ", ".join(formula.functions[:3])
            if len(formula.functions) > 3:
                funcs += "..."

            formula_display = formula.formula[:80]
            if len(formula.formula) > 80:
                formula_display += "..."

            self.formulas_tree.insert("", tk.END, text=location,
                                       values=(location, formula_display, funcs))

    def _filter_formulas(self, *args):
        """Filter the formulas list."""
        self._populate_formulas()

    def _on_category_select(self, event):
        """Handle category selection."""
        selection = self.category_list.curselection()
        if not selection:
            return

        idx = selection[0]
        cat_id = self.category_ids[idx]
        category = PROMPT_LIBRARY[cat_id]

        # Populate prompts list
        self.prompts_list.delete(0, tk.END)
        self._current_prompts = []
        for prompt in category["prompts"]:
            self.prompts_list.insert(tk.END, prompt["name"])
            self._current_prompts.append(prompt)

    def _on_prompt_select(self, event):
        """Handle prompt selection."""
        selection = self.prompts_list.curselection()
        if not selection:
            return

        idx = selection[0]
        prompt_data = self._current_prompts[idx]
        self.selected_prompt = get_prompt_by_id(prompt_data["id"])

        # Update preview
        self.preview_text.delete('1.0', tk.END)
        if self.selected_prompt:
            self.preview_text.insert('1.0', self.selected_prompt.prompt)

    def _generate_prompt(self):
        """Generate a prompt with context and show in output tab."""
        if not self.selected_prompt:
            messagebox.showwarning("No Prompt Selected", "Please select a prompt from the library first.")
            return

        custom_ctx = self.custom_context.get('1.0', tk.END).strip()
        full_prompt = generate_contextual_prompt(self.selected_prompt, self.analysis, custom_ctx)

        self.output_text.delete('1.0', tk.END)
        self.output_text.insert('1.0', full_prompt)

        # Switch to output tab
        self.notebook.select(self.output_frame)
        self.status_var.set("Prompt generated. Ready to copy!")

    def _copy_to_clipboard(self):
        """Copy the generated prompt to clipboard."""
        content = self.output_text.get('1.0', tk.END).strip()
        if content:
            self.root.clipboard_clear()
            self.root.clipboard_append(content)
            self.status_var.set("Copied to clipboard!")
        else:
            self.status_var.set("Nothing to copy.")

    def _copy_preview(self):
        """Copy the preview text to clipboard."""
        content = self.preview_text.get('1.0', tk.END).strip()
        if content:
            self.root.clipboard_clear()
            self.root.clipboard_append(content)
            self.status_var.set("Prompt copied to clipboard!")

    def _copy_formula(self, event):
        """Copy a formula from the list."""
        item = self.formulas_tree.selection()
        if item:
            values = self.formulas_tree.item(item[0], 'values')
            if values and len(values) >= 2:
                self.root.clipboard_clear()
                self.root.clipboard_append(f"={values[1]}")
                self.status_var.set("Formula copied to clipboard!")

    def _copy_contextual_prompt(self, event):
        """Copy a contextual prompt."""
        selection = self.ctx_prompts_list.curselection()
        if selection:
            idx = selection[0]
            prompt = self._contextual_prompts[idx]
            self.root.clipboard_clear()
            self.root.clipboard_append(prompt)
            self.status_var.set("Contextual prompt copied to clipboard!")

    def _export_markdown(self):
        """Export analysis as markdown."""
        if not self.analysis:
            messagebox.showwarning("No Analysis", "Please analyze a spreadsheet first.")
            return

        filepath = filedialog.asksaveasfilename(
            title="Export Analysis",
            defaultextension=".md",
            filetypes=[("Markdown files", "*.md"), ("All files", "*.*")],
            initialfile=f"{self.analysis.file_name}_analysis.md"
        )

        if filepath:
            markdown = export_analysis_markdown(self.analysis)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(markdown)
            self.status_var.set(f"Exported to {filepath}")

    def _show_about(self):
        """Show about dialog."""
        messagebox.showinfo(
            "About",
            "Spreadsheet Business Logic Extractor\n\n"
            "A tool for analyzing Excel spreadsheets and\n"
            "extracting business logic for documentation\n"
            "and code conversion.\n\n"
            "Version 1.0.0"
        )


def main():
    """Main entry point."""
    root = tk.Tk()
    app = SpreadsheetExtractorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
