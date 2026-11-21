/* ==========================================================================
   MATCHABAR — CONTROLADOR GLOBAL DE INTERFAZ Y AUDIO (js/main.js)
   Gestiona menú móvil, submenú táctil y reproductor instrumental de index.html
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. NAVEGACIÓN MÓVIL Y SUBMENÚ DESPLEGABLE TÁCTIL
    // ----------------------------------------------------------------------
    const btnMenuMovil = document.getElementById('btn-menu-movil');
    const navPrincipal = document.getElementById('nav-principal');
    const itemsConSubmenu = document.querySelectorAll('.nav-item.tiene-submenu');

    function cerrarMenuMovil() {
        if (!navPrincipal || !btnMenuMovil) {
            return;
        }
        navPrincipal.classList.remove('menu-abierto');
        btnMenuMovil.setAttribute('aria-expanded', 'false');
        btnMenuMovil.innerHTML = '&#9776;';

        itemsConSubmenu.forEach((item) => {
            item.classList.remove('submenu-abierto');
        });
    }

    if (btnMenuMovil && navPrincipal) {
        btnMenuMovil.addEventListener('click', () => {
            const estaAbierto = navPrincipal.classList.toggle('menu-abierto');
            btnMenuMovil.setAttribute('aria-expanded', String(estaAbierto));
            btnMenuMovil.innerHTML = estaAbierto ? '&times;' : '&#9776;';
        });
    }

    // En pantallas móviles (<= 820px), el primer toque en "Productos" abre el submenú;
    // el segundo toque navega a productos.html
    itemsConSubmenu.forEach((item) => {
        const enlacePadre = item.querySelector(':scope > .nav-enlace');

        if (!enlacePadre) {
            return;
        }

        enlacePadre.addEventListener('click', (event) => {
            if (window.innerWidth <= 820 && !item.classList.contains('submenu-abierto')) {
                event.preventDefault();
                item.classList.add('submenu-abierto');
            }
        });
    });

    // Cierra el menú móvil al presionar Escape o al hacer clic fuera del header
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cerrarMenuMovil();
        }
    });

    document.addEventListener('click', (event) => {
        const header = document.querySelector('.site-header');
        if (header && navPrincipal && navPrincipal.classList.contains('menu-abierto')) {
            if (!header.contains(event.target)) {
                cerrarMenuMovil();
            }
        }
    });

    // Restablece el estado móvil si se redimensiona la ventana a escritorio
    window.addEventListener('resize', () => {
        if (window.innerWidth > 820) {
            cerrarMenuMovil();
        }
    });

    // ----------------------------------------------------------------------
    // 2. CONTROL FLOTANTE DE AUDIO INSTRUMENTAL (EXCLUSIVO DE index.html)
    // ----------------------------------------------------------------------
    const audioFondo = document.getElementById('musica-fondo');
    const controlAudio = document.getElementById('control-audio');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const audioEstadoTexto = document.getElementById('audio-estado-texto');

    if (audioFondo && controlAudio && btnAudioToggle && audioEstadoTexto) {
        // Volumen suave por defecto acorde al estilo ambiental Zen
        audioFondo.volume = 0.35;
        let audioDisponible = true;

        function actualizarInterfazAudio(reproduciendo) {
            if (reproduciendo) {
                controlAudio.classList.add('reproduciendo');
                btnAudioToggle.innerHTML = '&#10074;&#10074;';
                btnAudioToggle.setAttribute('aria-label', 'Pausar música ambiental');
                audioEstadoTexto.textContent = 'Reproduciendo Zen Lo-Fi';
            } else {
                controlAudio.classList.remove('reproduciendo');
                btnAudioToggle.innerHTML = '&#9658;';
                btnAudioToggle.setAttribute('aria-label', 'Reproducir música ambiental');
                audioEstadoTexto.textContent = audioDisponible
                    ? 'Pausado — Clic para oír'
                    : 'Agrega el MP3 en assets/audio/';
            }
        }

        // Detecta si el archivo MP3 aún no se encuentra en la carpeta assets/audio/
        audioFondo.addEventListener('error', () => {
            audioDisponible = false;
            actualizarInterfazAudio(false);
        });

        const fuenteAudio = audioFondo.querySelector('source');
        if (fuenteAudio) {
            fuenteAudio.addEventListener('error', () => {
                audioDisponible = false;
                actualizarInterfazAudio(false);
            });
        }

        btnAudioToggle.addEventListener('click', () => {
            if (!audioDisponible) {
                audioEstadoTexto.textContent = 'Falta matcha-zen-instrumental.mp3';
                return;
            }

            if (audioFondo.paused) {
                const promesaReproduccion = audioFondo.play();

                if (promesaReproduccion !== undefined) {
                    promesaReproduccion
                        .then(() => {
                            actualizarInterfazAudio(true);
                        })
                        .catch(() => {
                            actualizarInterfazAudio(false);
                        });
                } else {
                    actualizarInterfazAudio(true);
                }
            } else {
                audioFondo.pause();
                actualizarInterfazAudio(false);
            }
        });
    }
});