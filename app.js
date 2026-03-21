class NoteApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem("md-notes") || "[]");
        this.activeId = null;
        this.previewMode = false;

        this.notesList = document.getElementById("notesList");
        this.noteTitle = document.getElementById("noteTitle");
        this.markdownInput = document.getElementById("markdownInput");
        this.previewContent = document.getElementById("previewContent");
        this.editorPane = document.getElementById("editorPane");
        this.previewPane = document.getElementById("previewPane");
        this.editorContainer = document.getElementById("editorContainer");
        this.emptyState = document.getElementById("emptyState");
        this.charCount = document.getElementById("charCount");
        this.lastSaved = document.getElementById("lastSaved");
        this.noteCount = document.getElementById("noteCount");
        this.searchInput = document.getElementById("searchInput");
        this.toggleBtn = document.getElementById("togglePreview");

        this.bindEvents();
        this.render();
    }

    bindEvents() {
        document.getElementById("newNoteBtn").addEventListener("click", () => this.createNote());
        document.getElementById("deleteNote").addEventListener("click", () => this.deleteNote());
        this.toggleBtn.addEventListener("click", () => this.togglePreview());

        this.markdownInput.addEventListener("input", () => {
            this.saveCurrentNote();
            this.updatePreview();
            this.updateCharCount();
        });

        this.noteTitle.addEventListener("input", () => {
            this.saveCurrentNote();
            this.renderList();
        });

        this.searchInput.addEventListener("input", () => this.renderList());

        // Tab key support in textarea
        this.markdownInput.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.substring(0, start) + "    " + e.target.value.substring(end);
                e.target.selectionStart = e.target.selectionEnd = start + 4;
                this.saveCurrentNote();
            }
        });
    }

    createNote() {
        const note = {
            id: Date.now().toString(),
            title: "Untitled Note",
            content: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(note);
        this.persist();
        this.selectNote(note.id);
        this.renderList();
        this.noteTitle.focus();
        this.noteTitle.select();
    }

    deleteNote() {
        if (!this.activeId) return;
        if (!confirm("Are you sure you want to delete this note?")) return;

        this.notes = this.notes.filter(n => n.id !== this.activeId);
        this.activeId = null;
        this.persist();
        this.render();
    }

    selectNote(id) {
        this.activeId = id;
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        this.noteTitle.value = note.title;
        this.markdownInput.value = note.content;
        this.emptyState.style.display = "none";
        this.editorContainer.style.display = "flex";
        this.updatePreview();
        this.updateCharCount();
        this.updateLastSaved(note.updatedAt);
        this.renderList();
    }

    saveCurrentNote() {
        if (!this.activeId) return;
        const note = this.notes.find(n => n.id === this.activeId);
        if (!note) return;

        note.title = this.noteTitle.value || "Untitled Note";
        note.content = this.markdownInput.value;
        note.updatedAt = new Date().toISOString();

        this.persist();
        this.updateLastSaved(note.updatedAt);
    }

    togglePreview() {
        this.previewMode = !this.previewMode;

        if (this.previewMode) {
            this.editorPane.style.display = "none";
            this.previewPane.style.display = "block";
            this.toggleBtn.textContent = "Edit";
            this.toggleBtn.classList.add("active");
            this.updatePreview();
        } else {
            this.editorPane.style.display = "block";
            this.previewPane.style.display = "none";
            this.toggleBtn.textContent = "Preview";
            this.toggleBtn.classList.remove("active");
        }
    }

    updatePreview() {
        if (typeof marked !== "undefined") {
            this.previewContent.innerHTML = marked.parse(this.markdownInput.value || "*Nothing to preview yet*");
        } else {
            this.previewContent.textContent = this.markdownInput.value;
        }
    }

    updateCharCount() {
        const len = this.markdownInput.value.length;
        this.charCount.textContent = len + " character" + (len !== 1 ? "s" : "");
    }

    updateLastSaved(dateStr) {
        const d = new Date(dateStr);
        this.lastSaved.textContent = "Saved at " + d.toLocaleTimeString();
    }

    renderList() {
        const query = this.searchInput.value.toLowerCase();
        const filtered = this.notes.filter(n =>
            n.title.toLowerCase().includes(query) ||
            n.content.toLowerCase().includes(query)
        );

        this.notesList.innerHTML = filtered.map(note => {
            const preview = note.content.substring(0, 60).replace(/[#*_`]/g, "") || "Empty note";
            const date = new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            });
            const isActive = note.id === this.activeId ? "active" : "";

            return `<div class="note-item ${isActive}" onclick="app.selectNote('${note.id}')">
                <h3>${note.title}</h3>
                <p>${preview}</p>
                <div class="note-date">${date}</div>
            </div>`;
        }).join("");

        this.noteCount.textContent = this.notes.length + " note" + (this.notes.length !== 1 ? "s" : "");
    }

    render() {
        this.renderList();
        if (!this.activeId) {
            this.emptyState.style.display = "flex";
            this.editorContainer.style.display = "none";
        }
    }

    persist() {
        localStorage.setItem("md-notes", JSON.stringify(this.notes));
    }
}

const app = new NoteApp();
