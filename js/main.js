// --- Estado de la Terminal ---
let currentPath = '/home/user';
let user = 'guest';
const host = 'Icarus';
let terminalState = 'LOGIN_USERNAME'; // Estados: LOGIN_USERNAME, LOGIN_PASSWORD, LOGGED_IN
let loginUsername = '';

// --- Sistema de Correo Virtual ---
const mailSystem = {
    'admin': [
        {
            id: 1,
            sender: 'Nayar',
            subject: 'Propuesta de trabajo, micion EL LOCO DE ICARO',
            body: `Siro,\n\n
            No nos conocemos, pero deseo hacer cosas grandes. Quizás tú también. Desde hace tiempo noto que quieres cambiar las cosas, 
            pero el miedo o a veces, cosas extremas te paralizan. Así que es mejor jugar un juego dentro de este juego.
            Podría poner un montón de basura filosófica, pero no me parece que tenga sentido hacerme el intelectual; solo soy una
            persona inconforme. Descubrí que tu novia se fue con un militar jajajaja, lo siento así es la vida supongo. Mira
            ayúdame y te ayudaré a mandar de destino a ese militar muy muy lejos. Solo ayúdame con algunos encargos fáciles.
            Serás retribuido, lo prometo, además aprenderás mucho en el camino. Bien, en un par de días te mandaré un texto con
            instrucciones precisas. Estúdialo a conciencia. Sé que estudias bioquímica, así que sabes el valor que tiene el
            conocimiento. En fin, estaremos en contacto. Mantente atento y recuerda, no hagas cosas estúpidas, te estoy vigilando.
            Chao, loco.`,
            read: false
        }
    ]
};

// --- Referencias al DOM ---
const terminalBody = document.getElementById('terminal-body');

// --- Funciones Utilitarias del Núcleo ---
function resolvePath(path) {
    if (path.startsWith('/')) {
        return path;
    }
    const homeDir = `/home/${user}`;
    if (path === '~' || path === '') {
        return homeDir;
    }
    if (path === '..') {
        const parts = currentPath.split('/').filter(p => p);
        parts.pop();
        return '/' + parts.join('/');
    }
    return currentPath.replace(/\/$/, '') + '/' + path;
}

function getDirectoryFromPath(path) {
    const parts = path.split('/').filter(p => p);
    let current = fileSystem['/'];
    for (const part of parts) {
        if (current.content && current.content[part] && current.content[part].type === 'directory') {
            current = current.content[part];
        } else {
            return null; // Path not found or not a directory
        }
    }
    return current;
}

function getFileFromPath(path) {
    const dirPath = path.substring(0, path.lastIndexOf('/'));
    const fileName = path.substring(path.lastIndexOf('/') + 1);
    
    const directory = getDirectoryFromPath(dirPath === '' ? '/' : dirPath);
    if (!directory || !directory.content || !directory.content[fileName]) {
        return null;
    }
    return directory.content[fileName];
}

function createPromptLine() {
    const inputLine = document.createElement('div');
    inputLine.className = 'input-line';
    inputLine.innerHTML = `<span class="prompt">${user}@${host}:${currentPath}$</span><input id="terminal-input" type="text" autofocus>`;
    
    const oldInput = document.getElementById('terminal-input');
    if (oldInput) {
        oldInput.disabled = true;
        oldInput.removeAttribute('id');
    }

    terminalBody.appendChild(inputLine);
    
    const newInput = document.getElementById('terminal-input');
    newInput.addEventListener('keydown', handleCommand);
    newInput.focus();
}

// --- Lógica de Comandos ---
function handleCommand(event) {
    if (event.key !== 'Enter' || terminalState !== 'LOGGED_IN') return;

    const inputElement = event.target;
    const input = inputElement.value.trim();
    printToTerminal(`${user}@${host}:${currentPath}$ ${input}`, true); 

    inputElement.disabled = true;

    const [command, ...args] = input.split(' ');
    const arg = args.join(' ');
    const [subCommand, ...subArgs] = args;


    switch (command) {
        case 'help':
            printToTerminal('Comandos disponibles:');
            printToTerminal('  help             - Muestra esta ayuda.');
            printToTerminal('  ls               - Lista el contenido del directorio. Ejemplo: `ls`');
            printToTerminal('  cd <dir>         - Cambia de directorio. Ejemplo: `cd documentos`');
            printToTerminal('  cat <file>       - Muestra el contenido de un archivo. Ejemplo: `cat readme.txt`');
            printToTerminal('  nano <file>      - Abre el editor de texto. Ejemplo: `nano nota.txt`');
            printToTerminal('  download <file>  - Descarga un archivo. Ejemplo: `download musica/Homio.yt`');
            printToTerminal('  mail             - Gestiona tu correo. Subcomandos: `read <id>`, `delete <id>`.');
            printToTerminal('  clear            - Limpia la pantalla.');
            printToTerminal('  logout           - Cierra la sesión actual.');
            break;
        
        case 'mail':
            const userMail = mailSystem[user] || [];
            if (subCommand === 'read') {
                const mailId = parseInt(subArgs[0], 10);
                const mailToRead = userMail.find(m => m.id === mailId);
                if (mailToRead) {
                    printToTerminal('-----------------------------------');
                    printToTerminal(`De: ${mailToRead.sender}`);
                    printToTerminal(`Asunto: ${mailToRead.subject}`);
                    printToTerminal('-----------------------------------');
                    printToTerminal(mailToRead.body);
                    printToTerminal('-----------------------------------');
                    mailToRead.read = true;
                } else {
                    printToTerminal(`mail: no existe el correo con id ${mailId}.`);
                }
            } else if (subCommand === 'delete') {
                const mailId = parseInt(subArgs[0], 10);
                const mailIndex = userMail.findIndex(m => m.id === mailId);
                if (mailIndex > -1) {
                    userMail.splice(mailIndex, 1);
                    printToTerminal(`Correo con id ${mailId} eliminado.`);
                } else {
                    printToTerminal(`mail: no existe el correo con id ${mailId}.`);
                }
            } else {
                printToTerminal('Buzón de correo:');
                if (userMail.length === 0) {
                    printToTerminal('(Buzón vacío)');
                } else {
                    userMail.forEach(mail => {
                        const status = mail.read ? '[leído]' : '[NUEVO]';
                        printToTerminal(`  ${mail.id}: ${status} De: ${mail.sender} - Asunto: ${mail.subject}`);
                    });
                }
            }
            break;

        case 'download':
            if (!arg) {
                printToTerminal('download: especifica un nombre de archivo.');
                break;
            }
            const downloadFilePath = resolvePath(arg);
            const downloadFile = getFileFromPath(downloadFilePath);

            if (!downloadFile) {
                printToTerminal(`download: ${arg}: No existe el archivo.`);
                break;
            }

            const link = document.createElement('a');
            link.download = arg.split('/').pop(); // Get filename

            if (downloadFile.type === 'file') { // For text files
                const blob = new Blob([downloadFile.content], { type: 'text/plain' });
                link.href = URL.createObjectURL(blob);
                printToTerminal(`Descargando ${link.download}...`);
            } else if (downloadFile.url) { // For media files with URLs
                link.href = downloadFile.url;
                link.target = '_blank'; // Open in new tab
                printToTerminal(`Intentando descargar ${link.download}... Si no se descarga automáticamente, se abrirá en una nueva pestaña. Desde ahí, puedes guardarlo manualmente (clic derecho > Guardar como).`);
            } else {
                printToTerminal(`download: no se puede descargar ${arg}.`);
                break;
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            if (link.href.startsWith('blob:')) {
                URL.revokeObjectURL(link.href);
            }
            break;

        case 'ls':
            const dir = getDirectoryFromPath(currentPath);
            if (dir && dir.content) {
                const items = Object.keys(dir.content).map(name => 
                    dir.content[name].type === 'directory' ? `<span style="color: #87ceeb;">${name}/</span>` : name
                ).join('  ');
                printToTerminal(items || '(directorio vacío)', true);
            } else {
                printToTerminal(`ls: no se puede acceder a '${currentPath}': No existe el directorio o el archivo`);
            }
            break;

        case 'cd':
            const newPath = arg ? resolvePath(arg) : resolvePath('~');
            const targetDir = getDirectoryFromPath(newPath);
            if (targetDir) {
                currentPath = newPath || '/';
                document.querySelector('.terminal-header .title').textContent = `${user}@${host}: ${currentPath}`;
            } else {
                printToTerminal(`cd: ${arg}: No existe el directorio o el archivo`);
            }
            break;
        
        case 'cat':
            const filePath = resolvePath(arg);
            const file = getFileFromPath(filePath);
            if (file) {
                if (file.type === 'file') {
                    printToTerminal(file.content);
                } else if (['image', 'audio', 'video'].includes(file.type)) {
                    openMediaViewer(file);
                } else {
                    printToTerminal(`cat: ${arg}: es un directorio`);
                }
            } else {
                printToTerminal(`cat: ${arg}: No existe el archivo o el directorio`);
            }
            break;
        
        case 'nano':
            if (!arg) {
                printToTerminal('nano: especifica un nombre de archivo.');
                break;
            }
            const nanoFilePath = resolvePath(arg);
            const nanoFile = getFileFromPath(nanoFilePath);
            if (nanoFile && nanoFile.type === 'file') {
                openNano(nanoFilePath, nanoFile.content);
            } else if (nanoFile && nanoFile.type !== 'file') {
                 printToTerminal(`nano: ${arg} es un directorio.`);
            } else {
                const dirPath = nanoFilePath.substring(0, nanoFilePath.lastIndexOf('/')) || '/';
                const dirForNewFile = getDirectoryFromPath(dirPath);
                if(dirForNewFile) {
                    const fileName = nanoFilePath.substring(nanoFilePath.lastIndexOf('/') + 1);
                    dirForNewFile.content[fileName] = { type: 'file', content: '' };
                    openNano(nanoFilePath, '');
                } else {
                    printToTerminal(`nano: No se puede crear el archivo '${arg}': La ruta no existe.`);
                }
            }
            break;

        case 'clear':
            terminalBody.innerHTML = '';
            break;

        case 'logout':
            initTerminal();
            return; 

        case '':
            break;

        default:
            printToTerminal(`${command}: comando no encontrado`);
            break;
    }
    
    createPromptLine();
}

// --- Lógica de Autenticación ---
function promptForUsername() {
    terminalState = 'LOGIN_USERNAME';
    const inputLine = document.createElement('div');
    inputLine.className = 'input-line';
    inputLine.innerHTML = `<span class="prompt">Username: </span><input id="terminal-input" type="text" autofocus>`;
    
    const oldInput = document.getElementById('terminal-input');
    if (oldInput) {
        oldInput.disabled = true;
        oldInput.removeAttribute('id');
    }
    
    terminalBody.appendChild(inputLine);
    const newInput = document.getElementById('terminal-input');
    newInput.addEventListener('keydown', handleLogin);
    newInput.focus();
}

function promptForPassword() {
    terminalState = 'LOGIN_PASSWORD';
    const inputLine = document.createElement('div');
    inputLine.className = 'input-line';
    inputLine.innerHTML = `<span class="prompt">Password: </span><input id="terminal-input" type="password">`;
    
    const oldInput = document.getElementById('terminal-input');
    if (oldInput) {
        oldInput.disabled = true;
        oldInput.removeAttribute('id');
    }

    terminalBody.appendChild(inputLine);
    const newInput = document.getElementById('terminal-input');
    newInput.addEventListener('keydown', handleLogin);
    newInput.focus();
}

function handleLogin(event) {
    if (event.key !== 'Enter') return;

    const input = event.target;
    const value = input.value.trim();
    input.disabled = true;

    if (terminalState === 'LOGIN_USERNAME') {
        loginUsername = value;
        input.parentElement.innerHTML = `<span class="prompt">Username: </span><span>${value}</span>`;
        promptForPassword();
    } else if (terminalState === 'LOGIN_PASSWORD') {
        const password = value;
        input.parentElement.innerHTML = `<span class="prompt">Password: </span><span>${'*'.repeat(password.length)}</span>`;

                    // Credenciales del personaje
                    if (loginUsername === 'admin' && password === '12345') {            terminalState = 'LOGGED_IN';
            user = loginUsername;
            
            // Crear directorio de home para el nuevo usuario si no existe
            if (!fileSystem['/'].content['home'].content[user]) {
                fileSystem['/'].content['home'].content[user] = JSON.parse(JSON.stringify(fileSystem['/'].content['home'].content['user']));
            }
            currentPath = `/home/${user}`;

            setTimeout(() => {
                terminalBody.innerHTML = '';
                const unreadMail = mailSystem[user] ? mailSystem[user].filter(m => !m.read).length : 0;
                
                printToTerminal(`Autenticación exitosa. ¡Bienvenido, ${user}!`);
                if (unreadMail > 0) {
                    printToTerminal(`Tienes (${unreadMail}) correo(s) nuevo(s). Escribe 'mail' para leerlos.`);
                }
                document.querySelector('.terminal-header .title').textContent = `${user}@${host}:${currentPath}`;
                printToTerminal("Escribe 'help' para ver la lista de comandos disponibles.");
                printToTerminal('');
                createPromptLine();
            }, 300);
        } else {
            printToTerminal('Acceso denegado. Inténtelo de nuevo.');
            setTimeout(() => {
                promptForUsername();
            }, 500);
        }
    }
}

// --- Inicialización ---
function initTerminal() {
    terminalBody.innerHTML = '';
    document.querySelector('.terminal-header .title').textContent = `guest@${host}: ~`;
    
    const banner = `
<span class="ascii-banner-art">
                                                        .                                           
                                                       .:                                           
                                                       :=                                           
                                                       =+                                           
                                                       *#                                           
                                                       %@.                                          
                                                      :@@-                 .::.                     
                                                      *@@#                  .=@%=                   
                                                    .-@@@@:                   *@@+                  
                                               .-==-.#@@@@#                   %@@=                  
                                           :=**=.  :#@@@@@@#:               .*@@+                   
                                       .=*%*-   :=#@@@@@@@@@@#+-.          -%@%-                    
                                    :+#@*-.-+*%@@@@@@@@@@@@@@@@@@%#+-.   -#@#=                      
                                  =#@%=.     .:=*%@@@@@@@@@@@@%*=:.   .=%%+:                        
                                =%@%-     .       :*@@@@@@@@*:     .=#%+:                           
                              .#@@+       +         :%@@@@@-    :=**=.                              
                             .%@@+       .%          -@@@@= .-=+=:                                  
                             :@@@        *@+          #@@@---.                                      
                              *@@-   .-+%@@@%+-.      =@@+                                          
                               :=*+-.  .=%@%-.        .@@:                                          
                                         -@:           #%                                           
                                          #            +*                                           
                                          -            -=                                           
                                                       :-                                           
                                                        .
</span>
--------------------------------------------------
System Info:
Plataforma: ${navigator.platform || 'Desconocida'}
Navegador (Agente): ${navigator.userAgent || 'Desconocido'}
CPUs Lógicas: ${navigator.hardwareConcurrency || 'Desconocidas'}
--------------------------------------------------
`;
    printToTerminal(banner, true);

    printToTerminal(' Hola loco te conectaste a la red de Sirio, comiensa tu salto.');
    printToTerminal('');
    promptForUsername();
}

initTerminal();
