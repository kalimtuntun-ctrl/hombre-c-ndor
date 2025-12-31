// --- Funciones Utilitarias de UI ---
function printToTerminal(text, isHtml = false) {
    const terminalBody = document.getElementById('terminal-body');
    const line = document.createElement('div');
    line.className = 'terminal-output-line';
    if (isHtml) {
        line.innerHTML = text;
    } else {
        line.textContent = text;
    }
    terminalBody.appendChild(line);
    terminalBody.scrollTop = terminalBody.scrollHeight; // Auto-scroll
}

// --- Funciones de los Programas (Modales) ---
let currentNanoPath = '';

function openNano(path, content) {
    currentNanoPath = path;
    document.getElementById('nano-title').textContent = `Editor Nano: ${path}`;
    document.getElementById('nano-textarea').value = content;
    document.getElementById('nano-modal').style.display = 'flex';
    document.getElementById('nano-textarea').focus();
}

function closeNano() {
    document.getElementById('nano-modal').style.display = 'none';
    document.getElementById('terminal-input').focus();
}

function saveAndCloseNano() {
    const content = document.getElementById('nano-textarea').value;
    const file = getFileFromPath(currentNanoPath);
    if (file) {
        file.content = content;
    }
    closeNano();
}

function getYouTubeID(url){
    let ID = '';
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if(url[2] !== undefined) {
      ID = url[2].split(/[^0-9a-z_\-]/i);
      ID = ID[0];
    }
    else {
      ID = url;
    }
    return ID;
}

function openMediaViewer(file) {
    const mediaContent = document.getElementById('media-content');
    const modalTitle = document.querySelector('#media-viewer .modal-header h3');
    let elementHtml = '';
    const isYouTube = file.url && (file.url.includes('youtube.com') || file.url.includes('youtu.be'));

    if (isYouTube) {
        const videoID = getYouTubeID(file.url);
        elementHtml = `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoID}?rel=0" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        modalTitle.textContent = 'Reproductor de YouTube';
    } else if (file.type === 'image') {
        modalTitle.textContent = 'Visor de Multimedia';
        elementHtml = `<img src="${file.url}" alt="Imagen">`;
    } else if (file.type === 'audio') {
        modalTitle.textContent = 'Visor de Multimedia';
        elementHtml = `<audio controls autoplay><source src="${file.url}" type="audio/mpeg">Tu navegador no soporta el elemento de audio.</audio>`;
    } else if (file.type === 'video') {
        modalTitle.textContent = 'Visor de Multimedia';
        elementHtml = `<video controls autoplay width="100%"><source src="${file.url}" type="video/mp4">Tu navegador no soporta el elemento de video.</video>`;
    }

    mediaContent.innerHTML = elementHtml;
    document.getElementById('media-viewer').style.display = 'flex';
}

function closeMediaViewer() {
    document.getElementById('media-content').innerHTML = '';
    document.getElementById('media-viewer').style.display = 'none';
    const termInput = document.getElementById('terminal-input');

    if(termInput) termInput.focus();
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        if(event.target.id === 'nano-modal') closeNano();
        if(event.target.id === 'media-viewer') closeMediaViewer();
    }
}
