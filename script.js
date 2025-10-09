(function() {
  'use strict';

  // ============================================
  // 1. DETECTAR Y GUARDAR VOLUNTARIO
  // ============================================
  function inicializarTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const voluntarioParam = urlParams.get('vol');
    
    if (voluntarioParam) {
      localStorage.setItem('isf_voluntario', voluntarioParam);
      console.log('✅ Voluntario detectado:', voluntarioParam);
      personalizarMensaje(voluntarioParam);
    } else {
      localStorage.removeItem('isf_voluntario');
      console.log('🧹 Parámetro vol no detectado, localStorage limpiado');
      removerMensajeVoluntario();
    }
  }

  // ============================================
  // 2. PERSONALIZAR MENSAJE EN LA PÁGINA (CORREGIDO)
  // ============================================
  function personalizarMensaje(codigoVoluntario) {
    const nombreFormateado = codigoVoluntario
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      let mensajeDiv = document.getElementById('mensaje-voluntario');
      // Si el mensaje no existe, lo creamos
      if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-voluntario';
        // Usamos prepend para añadirlo al inicio del hero-content, sin borrar nada
        heroContent.prepend(mensajeDiv);
      }
      // Actualizamos el contenido del mensaje
      mensajeDiv.innerHTML = `<p>🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong></p>`;
    }
  }

  // ============================================
  // 3. REMOVER MENSAJE DE VOLUNTARIO
  // ============================================
  function removerMensajeVoluntario() {
    const mensajeDiv = document.getElementById('mensaje-voluntario');
    if (mensajeDiv) {
      mensajeDiv.remove();
      console.log('🗑️ Mensaje de voluntario removido del DOM');
    }
  }

  // ============================================
  // 4. VALIDAR FORMULARIO DE DONANTE
  // ============================================
  function validarFormulario() {
    const donorNameInput = document.getElementById('donor-name');
    const donorEmailInput = document.getElementById('donor-email');
    const errorNameEl = document.getElementById('error-donor-name');
    const errorEmailEl = document.getElementById('error-donor-email');

    const name = donorNameInput.value.trim();
    const email = donorEmailInput.value.trim();
    let esValido = true;

    // Limpiar errores previos
    donorNameInput.classList.remove('error-input');
    errorNameEl.textContent = '';
    donorEmailInput.classList.remove('error-input');
    errorEmailEl.textContent = '';

    // Validación del Nombre
    if (name === '') {
      errorNameEl.textContent = 'Por favor, ingresa tu nombre completo.';
      donorNameInput.classList.add('error-input');
      esValido = false;
    }

    // Validación del Email
    if (email === '') {
      errorEmailEl.textContent = 'El correo electrónico es obligatorio.';
      donorEmailInput.classList.add('error-input');
      esValido = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorEmailEl.textContent = 'Por favor, ingresa un correo válido.';
      donorEmailInput.classList.add('error-input');
      esValido = false;
    }
    
    if (esValido) {
      return { name, email };
    } else {
      return null;
    }
  }

  // ============================================
  // 5. FUNCIÓN PRINCIPAL: IR A DONAR
  // ============================================
  function irADonar(monto, donante) {
  const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
  // El nombre del parámetro para el ID único es 'order', no 'external_id'.
  const orderId = self.crypto.randomUUID ? self.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
  
  const paykuConfig = {
    // La URL de redirección para el checkout web podría ser diferente. 
    // Vamos a probar con la que ya teníamos, pero si no funciona, 
    // hay que buscar en la documentación la URL específica para "Checkout Web" o "Integración por Redirección".
    baseUrl: 'https://des.payku.cl/payment', 
    publicKey: 'tkpucea57c4ac26436994d30a85a0ee8' 
  };
  
  // ¡AQUÍ ESTÁ EL CAMBIO MÁS IMPORTANTE!
  // Adaptamos los nombres de los parámetros a lo que la documentación de la API de Payku espera.
  const params = new URLSearchParams({
    // La documentación de Payku usa 'token' en lugar de 'publicKey' o 'apiKey' en los parámetros de la URL.
    // Esta es una suposición basada en la práctica común.
    token: paykuConfig.publicKey,

    email: donante.email,
    // La documentación no pide 'name', así que lo omitimos por ahora.
    order: orderId, // Cambiamos 'external_id' por 'order'
    subject: 'Donación ISF Chile',
    amount: monto,
    currency: 'CLP', // Añadimos la moneda, que es requerida.
    
    // El nombre del parámetro para la URL de retorno podría ser diferente.
    // La documentación que encontraste lo llama 'urlreturn'.
    urlreturn: `${window.location.origin}/gracias.html?order_id=${orderId}`,
    
    // Aunque no lo usamos para la redirección, es bueno saber que la URL del webhook se llama 'urlnotify'.
    // urlnotify: 'URL_DE_TU_WEBHOOK_DE_GOOGLE_APPS_SCRIPT',

    // Enviamos nuestros datos personalizados. La forma de enviarlos puede variar.
    // Probaremos con el formato que ya teníamos.
    'custom_fields[voluntario]': voluntario,
    'custom_fields[campana]': 'alcancia_digital_2025'
  });
  
  const urlCompleta = `${paykuConfig.baseUrl}?${params.toString()}`;
  
  console.log('🚀 Datos de donación (versión corregida):', {
    monto: monto,
    voluntario: voluntario,
    donante: donante,
    orderId: orderId,
    timestamp: new Date().toISOString()
  });

  console.log('Intentando redirigir a:', urlCompleta); // Línea para depurar la URL final
  
  window.location.href = urlCompleta;
}
  // ============================================
  // 6. INICIALIZAR BOTONES Y LÓGICA DE DONACIÓN
  // ============================================
  function inicializarEventosDonacion() {
    const botones = document.querySelectorAll('.donation-btn');
    
    botones.forEach(boton => {
      boton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const donante = validarFormulario();
        if (!donante) {
            console.error("Validación de datos del donante fallida.");
            return;
        }

        let monto;
        const customInput = document.getElementById('custom-amount-input');
        const customErrorEl = document.getElementById('error-custom-amount');
        
        // Limpiar error del monto personalizado
        customInput.classList.remove('error-input');
        customErrorEl.textContent = '';

        if (this.id === 'custom-amount-btn') {
            monto = parseInt(customInput.value, 10);
            if (isNaN(monto) || monto < 1000) {
                customErrorEl.textContent = 'Ingresa un monto válido (mínimo $1.000).';
                customInput.classList.add('error-input');
                customInput.focus();
                return;
            }
        } else {
            monto = parseInt(this.getAttribute('data-monto'), 10);
        }

        if (monto) {
          irADonar(monto, donante);
        }
      });
    });
    console.log(`✅ ${botones.length} botones de donación inicializados`);
  }

  // ============================================
  // 7. INICIAR TODO CUANDO EL DOM ESTÉ LISTO
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    inicializarTracking();
    inicializarEventosDonacion();
  });

})();
