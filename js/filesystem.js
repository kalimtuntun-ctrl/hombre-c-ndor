const fileSystem = {
    '/': {
        type: 'directory',
        content: {
            'home': {
                type: 'directory',
                content: {
                    'user': {
                        type: 'directory',
                        content: {
                            'documentos': {
                                type: 'directory',
                                content: {
                                    'nota.txt': { type: 'file', content: 'Este es un recordatorio importante.\n- Comprar leche\n- Llamar a Juan\n- Revisar el correo.' },
                                    'proyecto.md': { type: 'file', content: '# Mi Proyecto\n\n## Descripción\nEste es un archivo markdown de ejemplo.' },
                                    'trabajo.md': { type: 'file', content: '# P. Rescate AI\n\n## Descripción\n.' }
                                }
                            },
                            'imagenes': {
                                type: 'directory',
                                content: {
                                    'paisaje.jpg': { type: 'image', url: 'https://picsum.photos/seed/linuxsim/800/600.jpg' },
                                    'icono.png': { type: 'image', url: 'https://picsum.photos/seed/icon/128/128.jpg' }
                                }
                            },
                            'musica': {
                                type: 'directory',
                                content: {
                                    'cancion.mp3': { type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                                    'Omio.yt': { type: 'video', url: 'https://www.youtube.com/watch?v=Gf_BAOy90n4' }
                                }
                            },
                            'videos': {
                                type: 'directory',
                                content: {
                                    'clip.mp4': { type: 'video', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
                                }
                            },
                            'readme.txt': { type: 'file', content: 'Hola! Este es tu directorio personal.\nAquí puedes guardar tus archivos.' }
                        }
                    }
                }
            },
            'bin': {
                type: 'directory',
                content: {
                    'ls': { type: 'file', content: 'Comando para listar archivos.' },
                    'cd': { type: 'file', content: 'Comando para cambiar de directorio.' }
                }
            },
            'etc': {
                type: 'directory',
                content: {
                    'config.conf': { type: 'file', content: '# Configuración del sistema\ndebug=true\nport=8080' }
                }
            }
        }
    }
};
