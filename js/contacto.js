/* ==========================================================================
   MATCHABAR — MÓDULO DE FORMULARIOS DE CONTACTO Y SWEETALERT2 (js/contacto.js)
   Aplica validación estricta y confirmación estilizada en contacto.html e index.html
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const formularios = document.querySelectorAll('.js-form-contacto');

    if (formularios.length === 0) {
        return;
    }

    // Expresiones regulares para validación de campos
    const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const REGEX_TELEFONO = /^[+\d\s()-]{7,20}$/;

    /**
     * Evalúa individualmente si un campo cumple las reglas de formato requeridas.
     * @param {HTMLInputElement | HTMLTextAreaElement} campo
     * @returns {boolean}
     */
    function validarCampo(campo) {
        const valor = campo.value.trim();
        const nombreCampo = campo.name;
        let esValido = true;

        if (campo.hasAttribute('required') && valor === '') {
            esValido = false;
        } else if (nombreCampo === 'nombre' || nombreCampo === 'apellido') {
            esValido = valor.length >= 2;
        } else if (nombreCampo === 'telefono') {
            const soloDigitos = valor.replace(/\D/g, '');
            esValido = REGEX_TELEFONO.test(valor) && soloDigitos.length >= 7;
        } else if (nombreCampo === 'correo') {
            esValido = REGEX_CORREO.test(valor);
        } else if (nombreCampo === 'mensaje') {
            esValido = valor.length >= 10;
        }

        const grupo = campo.closest('.form-grupo');
        const textoError = grupo ? grupo.querySelector('.texto-error') : null;

        if (!esValido) {
            campo.classList.add('campo-invalido');
            campo.setAttribute('aria-invalid', 'true');
            if (textoError) {
                textoError.classList.add('visible');
            }
        } else {
            campo.classList.remove('campo-invalido');
            campo.removeAttribute('aria-invalid');
            if (textoError) {
                textoError.classList.remove('visible');
            }
        }

        return esValido;
    }

    /**
     * Limpia el estado visual de error en todos los campos de un formulario.
     * @param {HTMLFormElement} formulario
     */
    function limpiarErroresVisuales(formulario) {
        const campos = formulario.querySelectorAll('.form-control');
        const mensajesError = formulario.querySelectorAll('.texto-error');

        campos.forEach((campo) => {
            campo.classList.remove('campo-invalido');
            campo.removeAttribute('aria-invalid');
        });

        mensajesError.forEach((mensaje) => {
            mensaje.classList.remove('visible');
        });
    }

    /**
     * Dispara la alerta estilizada de SweetAlert2 con la paleta oficial de MatchaBar.
     * @param {string} nombreRemitente
     */
    function mostrarConfirmacionEnvio(nombreRemitente) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: '¡Mensaje enviado con éxito!',
                html: `Gracias, <strong>${nombreRemitente}</strong>.<br>Hemos recibido tu solicitud en MatchaBar Caracas y nuestro equipo te responderá muy pronto.`,
                confirmButtonText: 'Entendido',
                background: '#F5F2EB',
                color: '#243010',
                iconColor: '#87A330',
                confirmButtonColor: '#87A330',
                customClass: {
                    popup: 'swal-matchabar-popup'
                }
            });
        } else {
            alert(`¡Mensaje enviado con éxito! Gracias, ${nombreRemitente}. Nuestro equipo de MatchaBar te responderá muy pronto.`);
        }
    }

    // Asocia validación en vivo y control de envío a cada formulario del sitio
    formularios.forEach((formulario) => {
        const campos = formulario.querySelectorAll('.form-control');

        // Validación progresiva al corregir o salir del campo
        campos.forEach((campo) => {
            campo.addEventListener('blur', () => {
                validarCampo(campo);
            });

            campo.addEventListener('input', () => {
                if (campo.classList.contains('campo-invalido')) {
                    validarCampo(campo);
                }
            });
        });

        // Limpia errores visuales al presionar el botón "Limpiar Campos"
        formulario.addEventListener('reset', () => {
            limpiarErroresVisuales(formulario);
        });

        // Intercepta el envío para validar y mostrar SweetAlert2
        formulario.addEventListener('submit', (event) => {
            event.preventDefault();

            let formularioValido = true;
            let primerCampoInvalido = null;

            campos.forEach((campo) => {
                const campoOk = validarCampo(campo);
                if (!campoOk) {
                    formularioValido = false;
                    if (!primerCampoInvalido) {
                        primerCampoInvalido = campo;
                    }
                }
            });

            if (!formularioValido) {
                if (primerCampoInvalido) {
                    primerCampoInvalido.focus();
                }
                return;
            }

            // Construye el nombre del remitente (Nombre + Apellido si existe)
            const inputNombre = formulario.querySelector('[name="nombre"]');
            const inputApellido = formulario.querySelector('[name="apellido"]');
            const nombre = inputNombre ? inputNombre.value.trim() : 'Cliente';
            const apellido = inputApellido ? inputApellido.value.trim() : '';
            const nombreCompleto = apellido ? `${nombre} ${apellido}` : nombre;

            mostrarConfirmacionEnvio(nombreCompleto);
            formulario.reset();
            limpiarErroresVisuales(formulario);
        });
    });
});