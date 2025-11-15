// scripts.js (versión mínima y compatible LAN)
const API_BASE = `http://${window.location.hostname}:5000`;

let chatId = null;

const lista = document.getElementById("chats");
const nuevoChatBtn = document.getElementById("nuevoChat");
const conversacion = document.getElementById("conversacion");
const form = document.getElementById("mensajeForm");
const input = document.getElementById("inputMensaje");

// Configurar marked para usar highlight.js
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        return hljs.highlightAuto(code).value;
    }
});


async function cargarChats() {
    const res = await fetch(`${API_BASE}/chats`);
    const chats = await res.json();

    lista.innerHTML = "";
    chats.forEach(id => {
        const li = document.createElement("li");
        li.textContent = id;
        li.onclick = () => cargarChat(id);
        lista.appendChild(li);
    });
}

async function cargarChat(id) {
    chatId = id;

    const res = await fetch(`${API_BASE}/chat/${id}`);
    const messages = await res.json();

    conversacion.innerHTML = "";

    messages.forEach(m => {
        const div = document.createElement("div");
        div.className = "mensaje " + (m.role === "user" ? "usuario" : "bot");

        if (m.role === "assistant") {
            const html = marked.parse(m.content || "");
            div.innerHTML = DOMPurify.sanitize(html);

            // highlight
            div.querySelectorAll("pre code").forEach(block => {
                hljs.highlightElement(block);
            });

        } else {
            div.textContent = m.content;
        }


        conversacion.appendChild(div);
    });


    conversacion.scrollTop = conversacion.scrollHeight;
}

nuevoChatBtn.onclick = async () => {
    const res = await fetch(`${API_BASE}/new_chat`, {
        method: "POST"
    });
    const data = await res.json();
    await cargarChats();
    cargarChat(data.chat_id);
};

form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!chatId) return;

    const texto = input.value.trim();
    if (!texto) return;

    const userDiv = document.createElement("div");
    userDiv.className = "mensaje usuario";
    userDiv.textContent = texto;
    conversacion.appendChild(userDiv);
    conversacion.scrollTop = conversacion.scrollHeight;

    input.value = "";

    const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, message: texto })
    });

    const data = await res.json();

    const botDiv = document.createElement("div");
    botDiv.className = "mensaje bot";
    const html = marked.parse(data.reply || "");
    botDiv.innerHTML = DOMPurify.sanitize(html);
    botDiv.querySelectorAll("pre code").forEach(block => {
        hljs.highlightElement(block);
    });

    conversacion.appendChild(botDiv);
});

// --- Responsive nav toggle ---
const toggleBtn = document.getElementById("toggleNav");
const overlay = document.getElementById("overlay");

function openNav() {
    document.body.classList.add("nav-open");
    overlay.setAttribute("aria-hidden", "false");
}
function closeNav() {
    document.body.classList.remove("nav-open");
    overlay.setAttribute("aria-hidden", "true");
}

toggleBtn && toggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) closeNav();
    else openNav();
});

// cerrar al tocar overlay
overlay && overlay.addEventListener("click", closeNav);

// cerrar nav automáticamente al seleccionar un chat (útil en móvil)
const origCargarChat = cargarChat;
window.cargarChat = async function (id) {
    // usa la función original para carga real
    await origCargarChat(id);
    // en mobile cerramos el panel para mostrar la conversación
    if (window.innerWidth <= 900) closeNav();
};


// cargar lista al empezar
window.addEventListener("load", cargarChats);
