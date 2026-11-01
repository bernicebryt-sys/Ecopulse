const filterButtons = document.querySelectorAll(".filter-button");
const materialCards = document.querySelectorAll(".material-card");
const materialSearch = document.querySelector("#material-search");
const materialEmpty = document.querySelector("#material-empty");
let activeFilter = "all";

function filterMaterials() {
  const searchTerm = materialSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  materialCards.forEach((card) => {
    const categoryMatches = activeFilter === "all" || card.dataset.category === activeFilter;
    const searchMatches = card.dataset.search.includes(searchTerm);
    const isVisible = categoryMatches && searchMatches;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  materialEmpty.hidden = visibleCount > 0;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("is-active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    filterMaterials();
  });
});
materialSearch.addEventListener("input", filterMaterials);

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  });
});

const chatForm = document.querySelector("#chat-form");
const chatName = document.querySelector("#chat-name");
const chatMessage = document.querySelector("#chat-message");
const chatMessages = document.querySelector("#chat-messages");
const messageCount = document.querySelector("#message-count");
const characterCount = document.querySelector("#character-count");
const chatDisclaimer = document.querySelector(".chat-disclaimer");
const chatStorageKey = "good-earth-community-notes";
const maxSavedMessages = 50;
let messages = [];
let canSaveMessages = true;

function readMessages() {
  try {
    const savedMessages = localStorage.getItem(chatStorageKey);
    if (!savedMessages) return [];

    const parsedMessages = JSON.parse(savedMessages);
    if (!Array.isArray(parsedMessages)) throw new Error("Saved notes are not a list.");

    return parsedMessages.filter((message) =>
      message
      && typeof message.name === "string"
      && typeof message.text === "string"
      && typeof message.createdAt === "string"
    ).slice(-maxSavedMessages);
  } catch {
    canSaveMessages = false;
    chatDisclaimer.textContent = "Saved notes couldn't be read in this browser. You can still write a note for this visit.";
    return [];
  }
}

function renderMessages() {
  chatMessages.replaceChildren();

  if (messages.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "chat-empty";
    emptyMessage.textContent = "No notes yet. What does sustainability look like in your everyday?";
    chatMessages.append(emptyMessage);
  } else {
    messages.forEach((message) => {
      const item = document.createElement("article");
      item.className = "chat-message";

      const avatar = document.createElement("span");
      avatar.className = "chat-avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = message.name.trim().charAt(0).toUpperCase() || "?";

      const body = document.createElement("div");
      body.className = "chat-message-body";
      const meta = document.createElement("p");
      meta.className = "chat-message-meta";
      const name = document.createElement("strong");
      name.textContent = message.name;
      const time = document.createElement("time");
      const date = new Date(message.createdAt);
      time.dateTime = message.createdAt;
      time.textContent = Number.isNaN(date.getTime())
        ? "Just now"
        : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
      const text = document.createElement("p");
      text.textContent = message.text;

      meta.append(name, time);
      body.append(meta, text);
      item.append(avatar, body);
      chatMessages.append(item);
    });
  }

  messageCount.textContent = `${messages.length} ${messages.length === 1 ? "NOTE" : "NOTES"}`;
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatMessage.addEventListener("input", () => {
  characterCount.textContent = `${chatMessage.value.length} / 280`;
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = chatName.value.trim();
  const text = chatMessage.value.trim();
  if (!name || !text) return;

  const nextMessages = [...messages, { name, text, createdAt: new Date().toISOString() }].slice(-maxSavedMessages);

  if (canSaveMessages) {
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(nextMessages));
    } catch {
      canSaveMessages = false;
      chatDisclaimer.textContent = "This browser couldn't save your note. It will remain visible until you leave this page.";
    }
  }

  messages = nextMessages;
  renderMessages();
  chatForm.reset();
  characterCount.textContent = "0 / 280";
  chatName.focus();
});

messages = readMessages();
renderMessages();