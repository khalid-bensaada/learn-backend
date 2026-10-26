document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll("[data-skill]");
  const connectors = document.querySelectorAll("[data-link]");
  const note = document.querySelector("#diagram-note");

  const info = {
    node: {
      title: "Node.js — the runtime",
      text: "Node.js runs JavaScript on the server and provides the environment in which Express executes.",
      links: ["node-express"],
    },
    express: {
      title: "Express — the HTTP layer",
      text: "Express receives requests, runs middleware, matches routes and returns responses.",
      links: ["node-express", "express-mongoose"],
    },
    mongoose: {
      title: "Mongoose — the data layer",
      text: "Mongoose models validate data and query MongoDB. It connects the Express routes to stored documents.",
      links: ["express-mongoose", "mongoose-mongo"],
    },
    docker: {
      title: "Docker — the environment",
      text: "Docker packages the application. Compose connects the application container to the MongoDB container.",
      links: ["node-express", "express-mongoose", "mongoose-mongo"],
    },
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const skill = button.dataset.skill;
      const selected = info[skill];

      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("selected", active);
        item.setAttribute("aria-pressed", String(active));
      });

      connectors.forEach((connector) => {
        connector.classList.toggle(
          "active",
          selected.links.includes(connector.dataset.link),
        );
      });

      if (note) {
        note.innerHTML = `<strong>${selected.title}</strong><br>${selected.text}`;
      }
    });
  });

  // The API demo only appears on the integration lesson.
  const form = document.querySelector("#note-form");
  const result = document.querySelector("#api-result");
  const refresh = document.querySelector("#refresh-notes");

  async function loadNotes() {
    if (!result) return;

    result.textContent = "Loading notes...";

    try {
      const response = await fetch("/api/notes");
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Request failed");

      result.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      result.textContent = `Error: ${error.message}. Is the server running?`;
    }
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const fields = new FormData(form);
      result.textContent = "Saving note...";

      try {
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: fields.get("title"),
            body: fields.get("body"),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not save note");
        }

        form.reset();
        await loadNotes();
      } catch (error) {
        result.textContent = `Error: ${error.message}`;
      }
    });
  }

  if (refresh) {
    refresh.addEventListener("click", loadNotes);
  }

  if (result) {
    loadNotes();
  }
});
