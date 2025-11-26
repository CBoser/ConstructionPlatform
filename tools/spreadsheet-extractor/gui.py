#!/usr/bin/env python3
"""
Spreadsheet Business Logic Extractor - GUI Application
A point-and-click tool for extracting business logic from Excel spreadsheets.
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, scrolledtext
import threading
from pathlib import Path
from typing import Optional
import webbrowser

from analyzer import SpreadsheetAnalyzer, AnalysisResult
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
