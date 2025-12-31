// --- Estado de la Terminal ---
let currentPath = '/home/user';
let user = 'guest';
const host = 'linux-sim';
let terminalState = 'LOGIN_USERNAME'; // Estados: LOGIN_USERNAME, LOGIN_PASSWORD, LOGGED_IN
let loginUsername = '';

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

    switch (command) {
        case 'help':
            printToTerminal('Comandos disponibles:');
            printToTerminal('  help        - Muestra esta ayuda.');
            printToTerminal('  ls          - Lista el contenido del directorio.');
            printToTerminal('  cd <dir>    - Cambia de directorio. Usa ".." para ir al padre, "~" para tu home.');
            printToTerminal('  cat <file>  - Muestra el contenido de un archivo.');
            printToTerminal('  nano <file> - Abre el editor de texto para un archivo.');
            printToTerminal('  clear       - Limpia la pantalla.');
            printToTerminal('  logout      - Cierra la sesión actual.');
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

        // Credenciales predefinidas
        if (loginUsername === 'admin' && password === '12345') {
            terminalState = 'LOGGED_IN';
            user = loginUsername;
            
            // Crear directorio de home para el nuevo usuario si no existe
            if (!fileSystem['/'].content['home'].content[user]) {
                fileSystem['/'].content['home'].content[user] = JSON.parse(JSON.stringify(fileSystem['/'].content['home'].content['user']));
            }
            currentPath = `/home/${user}`;

            setTimeout(() => {
                terminalBody.innerHTML = '';
                printToTerminal(`Autenticación exitosa. ¡Bienvenido, ${user}!`);
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
hola loco te conectaste a la red de Sirio, comiensa tu salto.
--------------------------------------------------
System Info:
Plataforma: ${navigator.platform || 'Desconocida'}
Navegador (Agente): ${navigator.userAgent || 'Desconocido'}
CPUs Lógicas: ${navigator.hardwareConcurrency || 'Desconocidas'}
--------------------------------------------------
`;
    printToTerminal(banner);

    printToTerminal('Bienvenido a Lnux Icar. Por favor, inicie sesión.');
    printToTerminal('');
    promptForUsername();
}

initTerminal();
