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
  // 2. PERSONALIZAR MENSAJE EN LA PÁGINA
  // ============================================
  function personalizarMensaje(codigoVoluntario) {
    const nombreFormateado = codigoVoluntario
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
    
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      let mensajeDiv = document.getElementById('mensaje-voluntario');
      if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-voluntario';
        // Los estilos ahora están en el CSS para una mejor organización
        heroContent.insertAdjacentHTML('afterbegin', `
          <div id="mensaje-voluntario">
            <p>🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong></p>
          </div>
        `);
      } else {
        mensajeDiv.innerHTML = `<p>🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong></p>`;
      }
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
  // 4. VALIDAR FORMULARIO DE DONANTE (VERSIÓN MEJORADA)
  // ============================================
  function validarFormulario() {
    const donorNameInput = document.getElementById('donor-name');
    const donorEmailInput = document.getElementById('donor-email');
    const errorNameEl = document.getElementById('error-donor-name');
    const errorEmailEl = document.getElementById('error-donor-email');

    const name = donorNameInput.value.trim();
    const email = donorEmailInput.value.trim();
    let esValido = true;

    // --- Limpiar errores previos ---
    donorNameInput.classList.remove('error-input');
    errorNameEl.textContent = '';
    donorEmailInput.classList.remove('error-input');
    errorEmailEl.textContent = '';

    // --- Validación del Nombre ---
    if (name === '') {
      errorNameEl.textContent = 'Por favor, ingresa tu nombre completo.';
      donorNameInput.classList.add('error-input');
      esValido = false;
    }

    // --- Validación del Email ---
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
    const uuid = self.crypto.randomUUID ? self.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    
    const paykuConfig = {
      baseUrl: 'https://app.payku.cl/payment',
      publicKey: 'tu_public_key_aqui' // ← ¡¡¡REEMPLAZAR CON TU PUBLIC KEY DE PAYKU!!!
    };
    
    const params = new URLSearchParams({
      email: donante.email,
      name: donante.name,
      amount: monto,
      subject: 'Donación ISF Chile',
      external_id: uuid,
      'custom_fields[voluntario]': voluntario,
      'custom_fields[campana]': 'alcancia_digital_2025',
      return_url: `${window.location.origin}/gracias.html?uuid=${uuid}`,
      cancel_url: window.location.href
    });
    
    const urlCompleta = `${paykuConfig.baseUrl}?${params.toString()}`;
    
    console.log('🚀 Datos de donación:', {
      monto: monto,
      voluntario: voluntario,
      donante: donante,
      uuid: uuid,
      timestamp: new Date().toISOString()
    });
    
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
