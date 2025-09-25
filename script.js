// Configuración global del sitio
const configuracionSitio = {
    tiempoCarga: 1200,
    emailPrincipal: 'famaprimaria@gmail.com'
};

// Clase principal para manejar todas las interacciones del portfolio
class PortfolioInteractivo {
    constructor() {
        this.inicializarEventos();
        this.configurarObservadores();
        this.manejarCargaInicial();
    }

    inicializarEventos() {
        const botonMenu = document.getElementById('botonMenuMovil');
        const listaNav = document.getElementById('listaNavegacion');
        
        botonMenu?.addEventListener('click', () => this.alternarMenuMovil());
        
        document.querySelectorAll('.enlace-navegacion').forEach(enlace => {
            enlace.addEventListener('click', () => this.cerrarMenuMovil());
        });

        document.getElementById('enlaceEmail')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.abrirEmailCliente();
        });

        this.configurarEfectoNavegacion();
        this.configurarInteraccionesHabilidades();
        this.configurarDesplazamientoSuave();
    }

    alternarMenuMovil() {
        const lista = document.getElementById('listaNavegacion');
        const icono = document.querySelector('#botonMenuMovil i');
        
        lista?.classList.toggle('menu-activo');
        icono?.classList.toggle('fa-bars');
        icono?.classList.toggle('fa-times');
    }

    cerrarMenuMovil() {
        const lista = document.getElementById('listaNavegacion');
        const icono = document.querySelector('#botonMenuMovil i');
        
        lista?.classList.remove('menu-activo');
        icono?.classList.add('fa-bars');
        icono?.classList.remove('fa-times');
    }

    abrirEmailCliente() {
        const asunto = encodeURIComponent('¡Hola! Me encanta tu portafolio');
        const cuerpo = encodeURIComponent(`Hola,

Me ha impresionado tu trabajo y me gustaría conectar contigo...

¡Saludos!`);
        
        window.location.href = `mailto:${configuracionSitio.emailPrincipal}?subject=${asunto}&body=${cuerpo}`;
    }

    configurarEfectoNavegacion() {
        let ultimaPosicion = 0;
        const navegacion = document.querySelector('.navegacion-superior');
        
        window.addEventListener('scroll', () => {
            const posicionActual = window.pageYOffset;
            
            if (posicionActual > 100) {
                navegacion.style.background = 'rgba(103, 102, 241, 0.95)';
                navegacion.style.backdropFilter = 'blur(20px)';
                navegacion.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navegacion.style.background = 'transparent';
                navegacion.style.backdropFilter = 'none';
                navegacion.style.boxShadow = 'none';
            }
            
            ultimaPosicion = posicionActual;
        });
    }

    configurarInteraccionesHabilidades() {
        const habilidades = document.querySelectorAll('.etiqueta-habilidad');
        const colores = [
            'var(--acento-principal)',
            'var(--acento-secundario)', 
            'var(--verde-exito)',
            'var(--naranja-advertencia)'
        ];

        habilidades.forEach((habilidad, indice) => {
            const colorAleatorio = colores[indice % colores.length];
            
            habilidad.addEventListener('mouseenter', () => {
                habilidad.style.background = colorAleatorio;
                habilidad.style.borderColor = colorAleatorio;
                habilidad.style.color = 'white';
            });
            
            habilidad.addEventListener('mouseleave', () => {
                habilidad.style.background = 'white';
                habilidad.style.borderColor = 'var(--borde-sutil)';
                habilidad.style.color = 'var(--acento-principal)';
            });
        });
    }

    configurarDesplazamientoSuave() {
        document.querySelectorAll('a[href^="#"]').forEach(ancla => {
            ancla.addEventListener('click', function(e) {
                e.preventDefault();
                const objetivo = document.querySelector(this.getAttribute('href'));
                
                if (objetivo) {
                    const posicion = objetivo.getBoundingClientRect().top + window.pageYOffset - 80;
                    
                    window.scrollTo({
                        top: posicion,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    configurarObservadores() {
        const opciones = {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        };

        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach(entrada => {
                if (entrada.isIntersecting) {
                    this.animarElemento(entrada.target);
                }
            });
        }, opciones);

        const elementosAnimables = document.querySelectorAll(
            '.tarjeta-proyecto, .metodo-contacto, .etiqueta-habilidad, .avatar-principal'
        );
        
        elementosAnimables.forEach(elemento => {
            elemento.style.opacity = '0';
            elemento.style.transform = 'translateY(30px)';
            elemento.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            observador.observe(elemento);
        });
    }

    animarElemento(elemento) {
        const retrasoAleatorio = Math.random() * 200;
        
        setTimeout(() => {
            elemento.style.opacity = '1';
            elemento.style.transform = 'translateY(0)';
        }, retrasoAleatorio);
    }

    manejarCargaInicial() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const pantallaCarga = document.getElementById('pantallaCarga');
                pantallaCarga?.classList.add('oculta');
                
                setTimeout(() => {
                    pantallaCarga?.remove();
                }, 600);
                
                this.mostrarMensajeDeveloper();
                this.actualizarAnoActual();
            }, configuracionSitio.tiempoCarga);
        });
    }

    mostrarMensajeDeveloper() {
        const estilosMensaje = `
            color: #6366f1;
            font-size: 16px;
            font-weight: bold;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        `;
        
        const estilosSubtitulo = `
            color: #8b5cf6;
            font-size: 14px;
        `;

        console.log('%c🚀 ¡Hola, fellow developer!', estilosMensaje);
        console.log('%c\nEste sitio fue creado con:', estilosSubtitulo);
        console.log('• HTML5 semántico y accesible');
        console.log('• CSS3 con custom properties y animaciones');
        console.log('• JavaScript vanilla con clases ES6');
        console.log('• Diseño responsivo mobile-first');
        console.log('• Optimizaciones de rendimiento');
        console.log('• Intersection Observer API');
        console.log('• Cubic-bezier transitions personalizadas');
        console.log('\n¿Te gusta lo que ves? 👀');
        console.log(`📧 Escríbeme: ${configuracionSitio.emailPrincipal}`);
        console.log('\n' + '='.repeat(50));
        console.log('💡 Tip: Inspecciona las animaciones y efectos hover');
        console.log('✨ Cada detalle fue pensado para una UX increíble');
    }

// Funciones de utilidad adicionales
class UtilsPortfolio {
    static agregarEfectoParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.parallax');
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    static manejarVisibilidadElementos() {
        const elementos = document.querySelectorAll('[data-animate]');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        });

        elementos.forEach(elemento => {
            observer.observe(elemento);
        });
    }

    static configurarTemaOscuro() {
        const toggleTheme = () => {
            document.body.classList.toggle('tema-oscuro');
            localStorage.setItem('tema', 
                document.body.classList.contains('tema-oscuro') ? 'oscuro' : 'claro'
            );
        };

        // Recuperar tema guardado
        const temaSaved = localStorage.getItem('tema');
        if (temaSaved === 'oscuro') {
            document.body.classList.add('tema-oscuro');
        }

        // Agregar botón de tema si existe
        const botonTema = document.getElementById('toggleTema');
        botonTema?.addEventListener('click', toggleTheme);
    }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioInteractivo();
    
    // Funcionalidades adicionales opcionales
    // UtilsPortfolio.agregarEfectoParallax();
    // UtilsPortfolio.manejarVisibilidadElementos();
    // UtilsPortfolio.configurarTemaOscuro();
});

// Manejo de errores global
window.addEventListener('error', (e) => {
    console.warn('Se detectó un error menor:', e.message);
});

// Optimización de rendimiento
window.addEventListener('beforeunload', () => {
    // Limpiar event listeners y timers si es necesario
    document.removeEventListener('scroll', () => {});

});

