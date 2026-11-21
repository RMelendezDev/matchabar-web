/* ==========================================================================
   MATCHABAR — MÓDULO CALCULADORA DE PRESUPUESTO (js/calculadora.js)
   Cálculo reactivo y por botón con tabla HTML semántica y descuento por volumen
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Referencias principales del DOM
    const formCalculadora = document.getElementById('form-calculadora');
    const checkboxes = document.querySelectorAll('.calc-checkbox');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const resumenTbody = document.getElementById('resumen-tbody');
    const valorSubtotal = document.getElementById('valor-subtotal');
    const valorDescuento = document.getElementById('valor-descuento');
    const valorTotal = document.getElementById('valor-total');
    const avisoDescuento = document.getElementById('aviso-descuento');
    const panelResumen = document.getElementById('panel-resumen');

    // Si la página actual no contiene la calculadora, finaliza sin errores
    if (!formCalculadora || !resumenTbody) {
        return;
    }

    // Reglas comerciales de descuento por volumen
    const UMBRAL_DESCUENTO = 100.0;
    const PORCENTAJE_DESCUENTO = 0.10;

    /**
     * Formatea un valor numérico a moneda USD con dos decimales.
     * @param {number} monto
     * @returns {string}
     */
    function formatearUSD(monto) {
        return `$${monto.toFixed(2)}`;
    }

    /**
     * Valida y normaliza la cantidad ingresada dentro del rango [min, max].
     * @param {HTMLInputElement} inputCantidad
     * @returns {number}
     */
    function obtenerCantidadValida(inputCantidad) {
        const min = parseInt(inputCantidad.min, 10) || 1;
        const max = parseInt(inputCantidad.max, 10) || 50;
        let valor = parseInt(inputCantidad.value, 10);

        if (Number.isNaN(valor) || valor < min) {
            valor = min;
        } else if (valor > max) {
            valor = max;
        }

        inputCantidad.value = valor;
        return valor;
    }

    /**
     * Crea una fila <tr> segura para la tabla de resumen sin usar innerHTML con datos variables.
     * @param {string} nombre
     * @param {number} cantidad
     * @param {number} precioUnitario
     * @param {number} subtotal
     * @returns {HTMLTableRowElement}
     */
    function crearFilaResumen(nombre, cantidad, precioUnitario, subtotal) {
        const fila = document.createElement('tr');

        const tdNombre = document.createElement('td');
        tdNombre.textContent = nombre;

        const tdCantidad = document.createElement('td');
        tdCantidad.className = 'celda-numero';
        tdCantidad.textContent = String(cantidad);

        const tdPrecio = document.createElement('td');
        tdPrecio.className = 'celda-numero';
        tdPrecio.textContent = formatearUSD(precioUnitario);

        const tdSubtotal = document.createElement('td');
        tdSubtotal.className = 'celda-numero';
        tdSubtotal.textContent = formatearUSD(subtotal);

        fila.append(tdNombre, tdCantidad, tdPrecio, tdSubtotal);
        return fila;
    }

    /**
     * Recalcula el presupuesto completo y actualiza la tabla HTML y avisos en el DOM.
     */
    function calcularPresupuesto() {
        const itemsSeleccionados = [];
        let subtotalBruto = 0;

        checkboxes.forEach((checkbox) => {
            const targetId = checkbox.dataset.target;
            const inputCantidad = document.getElementById(targetId);

            if (!inputCantidad) {
                return;
            }

            if (checkbox.checked) {
                const nombre = checkbox.dataset.nombre || 'Ítem MatchaBar';
                const precioUnitario = parseFloat(checkbox.dataset.precio) || 0;
                const cantidad = obtenerCantidadValida(inputCantidad);
                const subtotalItem = precioUnitario * cantidad;

                subtotalBruto += subtotalItem;
                itemsSeleccionados.push({
                    nombre,
                    cantidad,
                    precioUnitario,
                    subtotalItem
                });
            }
        });

        // Limpia el cuerpo actual de la tabla antes de renderizar
        resumenTbody.textContent = '';

        if (itemsSeleccionados.length === 0) {
            const filaVacia = document.createElement('tr');
            const tdVacio = document.createElement('td');
            tdVacio.colSpan = 4;
            tdVacio.textContent = 'Selecciona uno o más productos o servicios para ver el cálculo detallado.';
            filaVacia.appendChild(tdVacio);
            resumenTbody.appendChild(filaVacia);

            valorSubtotal.textContent = '$0.00';
            valorDescuento.textContent = '-$0.00';
            valorTotal.textContent = '$0.00';

            avisoDescuento.textContent = 'Agrega $100.00 USD o más en tu pedido para obtener un 10% de descuento automático por volumen.';
            return;
        }

        // Inserta cada ítem seleccionado en el <tbody>
        itemsSeleccionados.forEach((item) => {
            const fila = crearFilaResumen(
                item.nombre,
                item.cantidad,
                item.precioUnitario,
                item.subtotalItem
            );
            resumenTbody.appendChild(fila);
        });

        // Evalúa si aplica el descuento por volumen (10% a partir de $100 USD)
        const aplicaDescuento = subtotalBruto >= UMBRAL_DESCUENTO;
        const montoDescuento = aplicaDescuento ? subtotalBruto * PORCENTAJE_DESCUENTO : 0;
        const totalGeneral = subtotalBruto - montoDescuento;

        // Actualiza los totales del <tfoot>
        valorSubtotal.textContent = formatearUSD(subtotalBruto);
        valorDescuento.textContent = `-${formatearUSD(montoDescuento)}`;
        valorTotal.textContent = formatearUSD(totalGeneral);

        // Actualiza el mensaje dinámico de ahorro
        if (aplicaDescuento) {
            avisoDescuento.textContent = `¡Descuento por volumen aplicado! Estás ahorrando ${formatearUSD(montoDescuento)} (10% OFF por superar los $100.00 USD).`;
        } else {
            const faltante = UMBRAL_DESCUENTO - subtotalBruto;
            avisoDescuento.textContent = `Te faltan ${formatearUSD(faltante)} para activar el 10% de descuento automático por volumen.`;
        }
    }

    /**
     * Restablece todos los controles y limpia la tabla de resumen.
     */
    function limpiarSeleccion() {
        checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
            const inputCantidad = document.getElementById(checkbox.dataset.target);
            if (inputCantidad) {
                inputCantidad.value = '1';
                inputCantidad.disabled = true;
            }
        });

        calcularPresupuesto();
    }

    // Eventos en checkboxes y campos de cantidad para cálculo en tiempo real
    checkboxes.forEach((checkbox) => {
        const inputCantidad = document.getElementById(checkbox.dataset.target);

        checkbox.addEventListener('change', () => {
            if (inputCantidad) {
                inputCantidad.disabled = !checkbox.checked;
                if (checkbox.checked) {
                    obtenerCantidadValida(inputCantidad);
                } else {
                    inputCantidad.value = '1';
                }
            }
            calcularPresupuesto();
        });

        if (inputCantidad) {
            inputCantidad.addEventListener('input', () => {
                if (checkbox.checked && inputCantidad.value !== '') {
                    calcularPresupuesto();
                }
            });

            inputCantidad.addEventListener('change', () => {
                if (checkbox.checked) {
                    obtenerCantidadValida(inputCantidad);
                    calcularPresupuesto();
                }
            });
        }
    });

    // Botón explícito "Calcular Presupuesto" (útil en móviles para enfocar el resumen)
    formCalculadora.addEventListener('submit', (event) => {
        event.preventDefault();
        calcularPresupuesto();

        if (panelResumen && window.innerWidth <= 1024) {
            panelResumen.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Botón "Limpiar Selección"
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', limpiarSeleccion);
    }

    // Inicialización al cargar la página
    calcularPresupuesto();
});