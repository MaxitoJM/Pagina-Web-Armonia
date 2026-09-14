// ---------------------------------------------------------------------------
// CONFIGURACION DE WHATSAPP
// ---------------------------------------------------------------------------
// Los formularios no envian correos: convierten lo que escribe el visitante en
// un mensaje de WhatsApp y abren la conversacion con el numero indicado aqui.
// Formato internacional, sin signos: 57 + numero.

// Linea que recibe el formulario de contacto del Centro de Conciliacion.
const WHATSAPP_FORMULARIO = '573132904984'; // Linea de Conciliacion

// Linea de la Escuela Colombiana de Violin (formulario de valoracion, boton
// flotante y llamados a la accion de la escuela).
const WHATSAPP_ESCUELA = '573105593959'; // 310 559 3959

// Correo que recibe los mensajes cuando el visitante elige "Enviar por correo".
const CORREO_CONTACTO = 'contacto@armoniaconcertada.co';

// Abre WhatsApp con el texto listo. Devuelve false si el navegador bloqueo la
// ventana. No se usa 'noopener' en window.open porque con esa opcion el
// navegador siempre devuelve null y no se podria saber si la ventana se abrio;
// en su lugar se corta la referencia al opener manualmente.
function abrirWhatsApp(numero, texto) {
    const enlace = 'https://wa.me/' + numero + '?text=' + encodeURIComponent(texto);
    const ventana = window.open(enlace, '_blank');
    if (!ventana) return false;
    try { ventana.opener = null; } catch (e) { /* sin acceso: nada que cortar */ }
    return true;
}

// Abre la aplicacion de correo del visitante con el mensaje ya redactado.
// Los saltos de linea se envian como CRLF, que es lo que esperan los clientes de correo.
function abrirCorreo(asunto, texto) {
    const cuerpo = texto.replace(/\r?\n/g, '\r\n');
    window.location.href = 'mailto:' + CORREO_CONTACTO +
        '?subject=' + encodeURIComponent(asunto) +
        '&body=' + encodeURIComponent(cuerpo);
}

// Muestra un aviso de exito o error bajo un formulario.
function mostrarAviso(elemento, texto, tipo) {
    const estilos = {
        exito: 'p-4 rounded-lg bg-green-100 text-green-700',
        error: 'p-4 rounded-lg bg-red-100 text-red-700'
    };
    elemento.textContent = texto;
    elemento.className = estilos[tipo];
    elemento.classList.remove('hidden');
    if (tipo === 'exito') {
        setTimeout(() => elemento.classList.add('hidden'), 8000);
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Enlaces de la escuela que dependen del numero configurado arriba
    document.querySelectorAll('[data-whatsapp-escuela]').forEach(enlace => {
        enlace.href = 'https://wa.me/' + WHATSAPP_ESCUELA;
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    // Abre o cierra el menu y sincroniza el bloqueo de scroll del body.
    // Antes, al tocar un enlace el menu se cerraba pero el body seguia con
    // overflow: hidden y la pagina quedaba sin poder desplazarse.
    const setMobileMenu = (open) => {
        if (!mobileMenuBtn || !mobileMenu) return;
        mobileMenu.classList.toggle('hidden', !open);
        mobileMenuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.style.overflow = open ? 'hidden' : '';
    };

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setMobileMenu(mobileMenu.classList.contains('hidden'));
        });

        // Close mobile menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setMobileMenu(false));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') &&
                !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                setMobileMenu(false);
            }
        });

        // Si se agranda la ventana hasta escritorio, el menu movil no debe quedar abierto
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) setMobileMenu(false);
        });
    }

    // Submenus de escritorio (Conciliacion / Escuela de Violin)
    const dropdowns = document.querySelectorAll('.nav-dropdown');

    const cerrarDropdowns = (excepto) => {
        dropdowns.forEach(dropdown => {
            if (dropdown === excepto) return;
            dropdown.classList.remove('is-open');
            const boton = dropdown.querySelector('.nav-dropdown-btn');
            if (boton) boton.setAttribute('aria-expanded', 'false');
        });
    };

    dropdowns.forEach(dropdown => {
        const boton = dropdown.querySelector('.nav-dropdown-btn');
        if (!boton) return;

        boton.addEventListener('click', (e) => {
            e.stopPropagation();
            const abrir = !dropdown.classList.contains('is-open');
            cerrarDropdowns(dropdown);
            dropdown.classList.toggle('is-open', abrir);
            boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
        });

        // Al elegir una opcion se cierra y se quita el foco, que de otro modo
        // mantendria el submenu abierto por :focus-within
        dropdown.querySelectorAll('a').forEach(enlace => {
            enlace.addEventListener('click', () => {
                cerrarDropdowns();
                enlace.blur();
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) cerrarDropdowns();
    });

    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const destino = this.getAttribute('href');
            if (destino.length < 2) return;
            const target = document.querySelector(destino);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
                backToTop.style.visibility = 'visible';
            } else {
                backToTop.style.opacity = '0';
                backToTop.style.visibility = 'hidden';
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ---------------- Formulario de contacto (inicio) ----------------
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm && formMessage) {
        // Valida y devuelve los datos; null si hay errores (ya quedan marcados)
        const leerContacto = () => {
            contactForm.querySelectorAll('.error-message').forEach(m => m.classList.add('hidden'));

            const datos = {
                nombre: document.getElementById('nombre').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefono: document.getElementById('telefono').value.trim(),
                asunto: document.getElementById('asunto').value.trim(),
                mensaje: document.getElementById('mensaje').value.trim()
            };
            const autorizacion = document.getElementById('autorizacion');

            let valido = true;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (datos.nombre === '') { showError('nombre'); valido = false; }
            if (datos.email === '' || !emailRegex.test(datos.email)) { showError('email'); valido = false; }
            if (datos.telefono === '') { showError('telefono'); valido = false; }
            if (datos.asunto === '') { showError('asunto'); valido = false; }
            if (datos.mensaje === '') { showError('mensaje'); valido = false; }
            if (autorizacion && !autorizacion.checked) { showError('autorizacion'); valido = false; }

            if (!valido) {
                mostrarAviso(formMessage, 'Por favor completa todos los campos correctamente.', 'error');
                return null;
            }
            return datos;
        };

        const redactarContacto = (datos) =>
            'Hola, escribo desde la página web.\n\n' +
            'Nombre: ' + datos.nombre + '\n' +
            'Correo: ' + datos.email + '\n' +
            'Teléfono: ' + datos.telefono + '\n' +
            'Asunto: ' + datos.asunto + '\n\n' +
            datos.mensaje;

        // Opcion 1: WhatsApp
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const datos = leerContacto();
            if (!datos) return;

            if (abrirWhatsApp(WHATSAPP_FORMULARIO, redactarContacto(datos))) {
                mostrarAviso(formMessage, 'Abrimos WhatsApp con tu mensaje listo. Recuerda pulsar enviar en la conversación.', 'exito');
            } else {
                // El navegador bloqueo la ventana emergente: no fingimos que se envio
                mostrarAviso(formMessage, 'Tu navegador bloqueó la apertura de WhatsApp. Permite las ventanas emergentes o escríbenos directamente al 313 290 4984.', 'error');
            }
        });

        // Opcion 2: correo electronico ya redactado
        const contactEmailBtn = document.getElementById('contactEmailBtn');
        if (contactEmailBtn) {
            contactEmailBtn.addEventListener('click', () => {
                const datos = leerContacto();
                if (!datos) return;
                abrirCorreo('Mensaje desde la página web: ' + datos.asunto, redactarContacto(datos));
                mostrarAviso(formMessage, 'Abrimos tu aplicación de correo con el mensaje listo para enviar. Si no se abrió, escríbenos a ' + CORREO_CONTACTO + '.', 'exito');
            });
        }
    }

    // ---------------- Formulario de valoracion (Escuela Colombiana de Violin) ----------------
    const valoracionForm = document.getElementById('valoracionForm');
    const valoracionMessage = document.getElementById('valoracionMessage');
    const chipPrograma = document.getElementById('programaSeleccionado');
    const chipProgramaTexto = document.getElementById('programaSeleccionadoTexto');
    const quitarPrograma = document.getElementById('quitarPrograma');
    let programaElegido = '';

    const actualizarChipPrograma = () => {
        if (!chipPrograma || !chipProgramaTexto) return;
        chipProgramaTexto.textContent = programaElegido;
        chipPrograma.classList.toggle('hidden', !programaElegido);
        chipPrograma.classList.toggle('flex', !!programaElegido);
    };

    // Los botones "Solicitar valoracion" de cada programa lo dejan preseleccionado
    document.querySelectorAll('[data-programa]').forEach(boton => {
        boton.addEventListener('click', () => {
            programaElegido = boton.dataset.programa;
            actualizarChipPrograma();
        });
    });

    if (quitarPrograma) {
        quitarPrograma.addEventListener('click', () => {
            programaElegido = '';
            actualizarChipPrograma();
        });
    }

    if (valoracionForm && valoracionMessage) {
        const leerValoracion = () => {
            valoracionForm.querySelectorAll('.error-message').forEach(m => m.classList.add('hidden'));

            const valor = (id) => document.getElementById(id).value.trim();
            const datos = {
                nombre: valor('vNombre'),
                edad: valor('vEdad'),
                experiencia: valor('vExperiencia'),
                ciudad: valor('vCiudad'),
                modalidad: valor('vModalidad'),
                telefono: valor('vTelefono'),
                horario: valor('vHorario')
            };
            const autorizacion = document.getElementById('vAutorizacion');
            const edad = Number(datos.edad);

            let valido = true;
            if (datos.nombre === '') { showError('vNombre'); valido = false; }
            if (datos.edad === '' || !Number.isInteger(edad) || edad < 3 || edad > 99) { showError('vEdad'); valido = false; }
            if (datos.experiencia === '') { showError('vExperiencia'); valido = false; }
            if (datos.ciudad === '') { showError('vCiudad'); valido = false; }
            if (datos.modalidad === '') { showError('vModalidad'); valido = false; }
            if (datos.telefono.replace(/\D/g, '').length < 7) { showError('vTelefono'); valido = false; }
            if (datos.horario === '') { showError('vHorario'); valido = false; }
            if (autorizacion && !autorizacion.checked) { showError('vAutorizacion'); valido = false; }

            if (!valido) {
                mostrarAviso(valoracionMessage, 'Por favor completa todos los campos correctamente.', 'error');
                return null;
            }
            datos.edad = edad;
            return datos;
        };

        const redactarValoracion = (datos) => {
            let texto =
                'Hola, quiero agendar una clase de valoración en la Escuela Colombiana de Violín.\n\n' +
                'Nombre del interesado: ' + datos.nombre + '\n' +
                'Edad del estudiante: ' + datos.edad + ' años\n' +
                'Experiencia previa: ' + datos.experiencia + '\n' +
                'Ciudad o sector: ' + datos.ciudad + '\n' +
                'Modalidad de interés: ' + datos.modalidad + '\n' +
                'Número de contacto: ' + datos.telefono + '\n' +
                'Horario preferido: ' + datos.horario;
            if (programaElegido) {
                texto += '\nPrograma de interés: ' + programaElegido;
            }
            return texto;
        };

        // Opcion 1: WhatsApp
        valoracionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const datos = leerValoracion();
            if (!datos) return;

            if (abrirWhatsApp(WHATSAPP_ESCUELA, redactarValoracion(datos))) {
                mostrarAviso(valoracionMessage, 'Abrimos WhatsApp con tu solicitud lista. Recuerda pulsar enviar en la conversación.', 'exito');
            } else {
                mostrarAviso(valoracionMessage, 'Tu navegador bloqueó la apertura de WhatsApp. Permite las ventanas emergentes o escríbenos directamente al 310 559 3959.', 'error');
            }
        });

        // Opcion 2: correo electronico ya redactado
        const valoracionEmailBtn = document.getElementById('valoracionEmailBtn');
        if (valoracionEmailBtn) {
            valoracionEmailBtn.addEventListener('click', () => {
                const datos = leerValoracion();
                if (!datos) return;
                abrirCorreo('Solicitud de clase de valoración – Escuela Colombiana de Violín', redactarValoracion(datos));
                mostrarAviso(valoracionMessage, 'Abrimos tu aplicación de correo con la solicitud lista para enviar. Si no se abrió, escríbenos a ' + CORREO_CONTACTO + '.', 'exito');
            });
        }
    }

    // Helper function to show error message
    function showError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        // El span de error suele ser hermano del campo, pero en la casilla de
        // autorizacion el input va dentro de un <label>, asi que subimos por el
        // arbol hasta encontrarlo (sin salir del formulario).
        let nodo = field.parentElement;
        while (nodo && nodo.tagName !== 'FORM') {
            const errorMessage = nodo.querySelector(':scope > .error-message');
            if (errorMessage) {
                errorMessage.classList.remove('hidden');
                return;
            }
            nodo = nodo.parentElement;
        }
    }

    // Header scroll effect
    const header = document.getElementById('header');

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('shadow-xl', window.scrollY > 100);
        });
    }

    // Animate elements on scroll (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all service cards and team members
    const animateElements = document.querySelectorAll('.service-card, .bg-gray-50.rounded-lg.shadow-lg');
    animateElements.forEach(el => observer.observe(el));

    // Aparicion de los bloques marcados con data-reveal. El retraso escalonado
    // (data-reveal-delay, en ms) se aplica aqui y no en CSS para que el hover de
    // las tarjetas no herede ese retraso.
    const revelables = document.querySelectorAll('[data-reveal]');
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revelar = (el) => el.classList.add('is-visible');

    if (reducirMovimiento || !('IntersectionObserver' in window)) {
        revelables.forEach(revelar);
    } else {
        const observadorReveal = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const retraso = parseInt(el.dataset.revealDelay || '0', 10);
                setTimeout(() => revelar(el), retraso);
                observadorReveal.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revelables.forEach(el => observadorReveal.observe(el));
    }

    // WhatsApp floating button (Insolvencias, Conciliacion y Escuela de Violin)
    const whatsappToggle = document.getElementById('whatsappToggle');
    const whatsappOptions = document.getElementById('whatsappOptions');

    if (whatsappToggle && whatsappOptions) {
        whatsappToggle.classList.add('float-animation');

        const setWhatsappOpen = (open) => {
            whatsappOptions.classList.toggle('hidden', !open);
            whatsappOptions.classList.toggle('flex', open);
            whatsappToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        whatsappToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            setWhatsappOpen(whatsappOptions.classList.contains('hidden'));
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!whatsappOptions.contains(e.target) && !whatsappToggle.contains(e.target)) {
                setWhatsappOpen(false);
            }
        });
    }

    // Escape cierra cualquier menu abierto
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        cerrarDropdowns();
        setMobileMenu(false);
        if (whatsappOptions && whatsappToggle) {
            whatsappOptions.classList.add('hidden');
            whatsappOptions.classList.remove('flex');
            whatsappToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Handle form input focus effects
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Ventanas emergentes (perfil completo). Se usa <dialog>: el navegador
    // gestiona el foco, la tecla Escape y el fondo oscurecido.
    document.querySelectorAll('[data-modal-open]').forEach(boton => {
        boton.addEventListener('click', () => {
            const dialogo = document.getElementById(boton.dataset.modalOpen);
            if (!dialogo) return;
            if (typeof dialogo.showModal === 'function') {
                dialogo.showModal();
            } else {
                dialogo.setAttribute('open', '');
            }
            dialogo.scrollTop = 0;
            document.body.style.overflow = 'hidden';
        });
    });

    document.querySelectorAll('dialog').forEach(dialogo => {
        const cerrar = () => {
            if (typeof dialogo.close === 'function') dialogo.close();
            else dialogo.removeAttribute('open');
            document.body.style.overflow = '';
        };
        dialogo.addEventListener('close', () => { document.body.style.overflow = ''; });
        // Clic en el fondo oscuro (fuera del contenido) cierra la ventana
        dialogo.addEventListener('click', (e) => { if (e.target === dialogo) cerrar(); });
        dialogo.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', cerrar));
    });

    // Add active class to current section in navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]:not([data-no-active])');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            if (window.scrollY >= (section.offsetTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('text-armonia-orange', link.getAttribute('href') === `#${current}`);
        });

        // El boton del submenu se resalta si la seccion actual pertenece a su grupo
        dropdowns.forEach(dropdown => {
            const grupo = (dropdown.dataset.secciones || '').split(' ');
            const boton = dropdown.querySelector('.nav-dropdown-btn');
            if (boton) boton.classList.toggle('text-armonia-orange', grupo.includes(current));
        });
    });
});
