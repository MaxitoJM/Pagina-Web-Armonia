// ---------------------------------------------------------------------------
// CONFIGURACION DEL FORMULARIO DE CONTACTO
// ---------------------------------------------------------------------------
// Clave de acceso de Web3Forms (https://web3forms.com). Es gratuita: se pide con
// el correo del centro y llega por email. Mientras este vacia, el envio por
// correo queda deshabilitado y el formulario dirige al visitante a WhatsApp.
// NO se muestra un falso "mensaje enviado" en ningun caso.
const WEB3FORMS_ACCESS_KEY = '';

// Linea de WhatsApp a la que se envian los mensajes del formulario.
const WHATSAPP_FORMULARIO = '573132904984'; // Conciliacion

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // Smooth Scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
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
            if (window.pageYOffset > 300) {
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
    
    // Contact Form Validation and Submission
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (contactForm && formMessage) {
        const submitBtn = document.getElementById('submitBtn');
        const whatsappFormBtn = document.getElementById('whatsappFormBtn');

        const mostrarMensaje = (texto, tipo) => {
            const estilos = {
                exito: 'p-4 rounded-lg bg-green-100 text-green-700',
                error: 'p-4 rounded-lg bg-red-100 text-red-700',
                aviso: 'p-4 rounded-lg bg-yellow-100 text-yellow-800'
            };
            formMessage.textContent = texto;
            formMessage.className = estilos[tipo];
            formMessage.classList.remove('hidden');
            if (tipo === 'exito') {
                setTimeout(() => formMessage.classList.add('hidden'), 8000);
            }
        };

        // Devuelve los datos si el formulario es valido; null si no lo es.
        const validar = () => {
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
                mostrarMensaje('Por favor completa todos los campos correctamente.', 'error');
                return null;
            }
            return datos;
        };

        // ---------------- Envio por correo (Web3Forms) ----------------
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const trampa = document.getElementById('sitioWeb');
            if (trampa && trampa.value !== '') { return; } // bot: se descarta en silencio

            const datos = validar();
            if (!datos) return;

            if (!WEB3FORMS_ACCESS_KEY) {
                mostrarMensaje('El envío por correo aún no está configurado. Por favor usa el botón "Enviar por WhatsApp" o escríbenos a contacto@armoniaconcertada.co', 'aviso');
                return;
            }

            const textoOriginal = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            try {
                const respuesta = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        access_key: WEB3FORMS_ACCESS_KEY,
                        subject: 'Nuevo mensaje del sitio web: ' + datos.asunto,
                        from_name: 'Sitio web Armonía Concertada',
                        nombre: datos.nombre,
                        email: datos.email,
                        telefono: datos.telefono,
                        asunto: datos.asunto,
                        mensaje: datos.mensaje,
                        autorizacion_datos: 'El titular autorizó el tratamiento de sus datos personales',
                        fecha_autorizacion: new Date().toISOString()
                    })
                });
                const resultado = await respuesta.json();

                if (respuesta.ok && resultado.success) {
                    mostrarMensaje('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'exito');
                    contactForm.reset();
                } else {
                    mostrarMensaje('No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por WhatsApp.', 'error');
                }
            } catch (error) {
                mostrarMensaje('No pudimos enviar tu mensaje. Revisa tu conexión o escríbenos por WhatsApp.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = textoOriginal;
            }
        });

        // ---------------- Envio alterno por WhatsApp ----------------
        if (whatsappFormBtn) {
            whatsappFormBtn.addEventListener('click', () => {
                const datos = validar();
                if (!datos) return;

                const texto =
                    'Hola, escribo desde la página web.\n\n' +
                    'Nombre: ' + datos.nombre + '\n' +
                    'Correo: ' + datos.email + '\n' +
                    'Teléfono: ' + datos.telefono + '\n' +
                    'Asunto: ' + datos.asunto + '\n\n' +
                    datos.mensaje;

                window.open('https://wa.me/' + WHATSAPP_FORMULARIO + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
                mostrarMensaje('Abrimos WhatsApp con tu mensaje listo para enviar. Recuerda pulsar enviar en la conversación.', 'exito');
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
    let lastScroll = 0;
    
    if (header) {
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.classList.add('shadow-xl');
            } else {
                header.classList.remove('shadow-xl');
            }
            
            lastScroll = currentScroll;
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
    
    // WhatsApp floating button (dos números: Insolvencias y Conciliación)
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

        // Cerrar con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                setWhatsappOpen(false);
            }
        });
    }
    
    // Handle form input focus effects
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.add('hidden');
        }
    });
    
    // Prevent body scroll when mobile menu is open
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            if (!mobileMenu.classList.contains('hidden')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Add active class to current section in navigation
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('text-armonia-orange');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-armonia-orange');
            }
        });
    });
});