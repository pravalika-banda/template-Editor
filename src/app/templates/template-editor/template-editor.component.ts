import { Component, AfterViewInit, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import Quill from "quill";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { TemplateService } from "../../services/template.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-template-editor",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./template-editor.component.html",
  styleUrl: "./template-editor.component.scss",
})
export class TemplateEditorComponent implements AfterViewInit {
  // ========================
  // QUILL INSTANCE
  // ========================
  quill!: any;

  // ========================
  // UI STATE
  // ========================
  darkMode = false;
  showMoreOptions = false;
  isEditMode = false;
  activeFormats: any = {};

  // ========================
  // TEMPLATE DETAILS
  // ========================
  templateName: string = ""; // <-- Added templateName
  templateId: number | null = null; // optional if you want to track ID

  // ========================
  // MENTIONS
  // ========================
  showMentions = false;
  mentionTop = 0;
  mentionLeft = 0;
  lastRange: any;

  mentionItems = [
    { id: 1, value: "Alice" },
    { id: 2, value: "Bob" },
    { id: 3, value: "Charlie" },
  ];

  filteredMentions = [...this.mentionItems];

  // ========================
  // LINK MODAL
  // ========================
  showLinkModal = false;
  linkText = "";
  linkUrl = "";

  constructor(
    private templateService: TemplateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  selectedFile!: File;

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", this.selectedFile);

    this.templateService.uploadFile(formData).subscribe({
      next: (res) => {
        console.log("Upload success", res);
      },
      error: (err) => {
        console.error("Upload failed", err);
      },
    });
  }

  // ========================
  // INIT
  // ========================
  ngAfterViewInit(): void {
    this.quill = new Quill("#editor", {
      theme: "snow",
      modules: {
        toolbar: false,
      },
    });

    // TEXT CHANGE LISTENER (MENTIONS)
    this.quill.on("text-change", () => this.onTextChange());

    // Track selection changes to update active buttons
    this.quill.on("selection-change", (range: any) => {
      if (range) {
        this.activeFormats = this.quill.getFormat(range);
      }
    });

    // 👇 LOAD TEMPLATE IF EDIT MODE
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (id) {
      this.isEditMode = true;
      this.templateId = id;

      this.templateService.getTemplate(id).subscribe({
        next: (template) => {
          this.templateName = template.name; // <-- bind template name
          this.quill.clipboard.dangerouslyPasteHTML(template.content);
        },
        error: () => {
          alert("Failed to load template");
        },
      });
    }

    // CLOSE MENTIONS WHEN CLICKING ELSEWHERE
    this.quill.root.addEventListener("click", () => {
      this.showMentions = false;
    });
  }

  // ========================
  // THEME
  // ========================
  toggleTheme() {
    this.darkMode = !this.darkMode;
  }

  // ========================
  // TOOLBAR ACTIONS
  // ========================
  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  applyFormat(format: string) {
    const range = this.quill.getSelection();
    if (!range) return;

    const current = this.quill.getFormat(range);
    const value = !current[format];
    this.quill.format(format, value);

    // Update activeFormats immediately for UI
    this.activeFormats[format] = value;
  }

  applyOption(type: string) {
    this.showMoreOptions = false;
    const range = this.quill.getSelection(true);
    if (!range) return;

    switch (type) {
      case "header1":
        this.quill.format("header", 1);
        break;

      case "header2":
        this.quill.format("header", 2);
        break;

      case "color":
        this.quill.format("color", "#2563eb");
        break;

      case "background":
        this.quill.format("background", "#fde047");
        break;

      case "blockquote":
        this.quill.format("blockquote", true);
        break;

      case "image": {
        const img = prompt("Enter image URL");
        if (img) this.quill.insertEmbed(range.index, "image", img);
        break;
      }

      case "video": {
        const vid = prompt("Enter video URL");
        if (vid) this.quill.insertEmbed(range.index, "video", vid);
        break;
      }
    }
  }

  deleteAll() {
    if (confirm("Delete all content?")) {
      this.quill.setText("");
    }
  }

  save() {
    const content = this.quill.root.innerHTML;

    const payload = {
      name: this.templateName, // <-- use templateName from input
      content: content,
    };

    if (this.isEditMode && this.templateId) {
      this.templateService.updateTemplate(this.templateId, payload).subscribe({
        next: (res) => {
          alert("Template updated successfully");
          this.router.navigate(["/templates"]);
        },
        error: (err) => {
          console.error(err);
          alert("Update failed");
        },
      });
    } else {
      this.templateService.createTemplate(payload).subscribe({
        next: (res) => {
          alert("Template saved successfully");
          this.router.navigate(["/templates"]);
        },
        error: (err) => {
          console.error(err);
          alert("Save failed");
        },
      });
    }
  }

  attachFile() {
    const input = document.createElement("input");
    input.type = "file";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      this.templateService.uploadFile(formData).subscribe({
        next: (res: any) => {
          const range = this.quill.getSelection(true) || { index: 0 };

          this.quill.insertText(range.index, file.name, {
            link: res.fileUrl, // REAL FILE LINK
          });

          this.quill.setSelection(range.index + file.name.length);
        },
        error: () => alert("File upload failed"),
      });
    };

    input.click();
  }

  // ========================
  // LINK MODAL
  // ========================
  openLinkModal() {
    const range = this.quill.getSelection(true);
    if (!range) return;

    this.lastRange = range;
    this.linkText = this.quill.getText(range.index, range.length) || "";
    this.linkUrl = "";
    this.showLinkModal = true;
  }

  closeLinkModal() {
    this.showLinkModal = false;
    this.linkText = "";
    this.linkUrl = "";
  }

  insertLink() {
    if (!this.linkUrl || !this.lastRange) return;

    const range = this.lastRange;

    if (range.length > 0) {
      this.quill.deleteText(range.index, range.length);
    }

    this.quill.insertText(range.index, this.linkText || this.linkUrl, {
      link: this.linkUrl,
    });

    this.quill.setSelection(
      range.index + (this.linkText.length || this.linkUrl.length)
    );

    this.closeLinkModal();
  }

  // ========================
  // MENTIONS LOGIC (@user)
  // ========================
  onTextChange() {
    const range = this.quill.getSelection();
    if (!range) return;

    this.lastRange = range;

    const textBefore = this.quill.getText(0, range.index);
    const match = textBefore.match(/@(\w*)$/);

    if (match) {
      const search = match[1].toLowerCase();

      this.filteredMentions = this.mentionItems.filter((item) =>
        item.value.toLowerCase().includes(search)
      );

      const bounds = this.quill.getBounds(range.index);

      this.mentionTop = bounds.top + bounds.height + 8;
      this.mentionLeft = bounds.left;

      this.showMentions = this.filteredMentions.length > 0;
    } else {
      this.showMentions = false;
    }
  }

  selectMention(item: any) {
    const range = this.lastRange;
    if (!range) return;

    const textBefore = this.quill.getText(0, range.index);
    const atIndex = textBefore.lastIndexOf("@");

    this.quill.deleteText(atIndex, range.index - atIndex);
    this.quill.insertText(atIndex, `@${item.value} `, { bold: true });

    this.quill.setSelection(atIndex + item.value.length + 2);
    this.showMentions = false;
  }

  // ========================
  // KEYBOARD SHORTCUTS
  // ========================
  @HostListener("document:keydown", ["$event"])
  handleShortcuts(e: KeyboardEvent) {
    if (!e.ctrlKey) return;

    switch (e.key.toLowerCase()) {
      case "b":
        this.quill.format("bold", true);
        e.preventDefault();
        break;

      case "i":
        this.quill.format("italic", true);
        e.preventDefault();
        break;

      case "u":
        this.quill.format("underline", true);
        e.preventDefault();
        break;

      case "s":
        this.save();
        e.preventDefault();
        break;
    }

    if (e.shiftKey && e.key.toLowerCase() === "d") {
      this.deleteAll();
      e.preventDefault();
    }
  }
}
