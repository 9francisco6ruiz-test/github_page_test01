(function() {
  'use strict';

  // ============================================
  // 1. DETECTAR Y GUARDAR VOLUNTARIO
  // ============================================
  function inicializarTracking() {
    const urlParams = new URLSearchParams(window.location.search);
    const voluntarioParam = urlParams.get('vol');
    
    if (voluntarioParam) {
      // Si viene el parámetro, guardarlo
      localStorage.setItem('isf_voluntario', voluntarioParam);
      console.log('✅ Voluntario detectado:', voluntarioParam);
      personalizarMensaje(voluntarioParam);
    } else {
      // Si NO viene el parámetro, limpiar cualquier valor guardado
      localStorage.removeItem('isf_voluntario');
      console.log('🧹 Parámetro vol no detectado, localStorage limpiado');
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
    
    const hero = document.querySelector('.hero');
    if (hero) {
      let mensajeDiv = document.getElementById('mensaje-voluntario');
      if (!mensajeDiv) {
        mensajeDiv = document.createElement('div');
        mensajeDiv.id = 'mensaje-voluntario';
        mensajeDiv.style.cssText = `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; padding: 15px 20px; border-radius: 10px; margin: 20px auto 0;
          max-width: 600px; text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        `;
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) { heroContent.appendChild(mensajeDiv); }
      }
      mensajeDiv.innerHTML = `<p style="margin: 0; font-size: 1.1rem;">🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong></p>`;
    }
  }

  // ============================================
  // 3. VALIDAR FORMULARIO DE DONANTE
  // ============================================
  function validarFormulario() {
    const donorNameInput = document.getElementById('donor-name');
    const donorEmailInput = document.getElementById('donor-email');
    
    const name = donorNameInput.value.trim();
    const email = donorEmailInput.value.trim();

    // Resetear estilos de error
    donorNameInput.style.borderColor = '#ccc';
    donorEmailInput.style.borderColor = '#ccc';

    if (!name) {
        alert('Por favor, ingresa tu nombre completo.');
        donorNameInput.style.borderColor = 'red';
        donorNameInput.focus();
        return null;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        alert('Por favor, ingresa un correo electrónico válido.');
        donorEmailInput.style.borderColor = 'red';
        donorEmailInput.focus();
        return null;
    }

    return { name, email };
  }

  // ============================================
  // 4. FUNCIÓN PRINCIPAL: IR A DONAR
  // ============================================
  function irADonar(monto, donante) {
    const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    
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
  // 5. INICIALIZAR BOTONES Y LÓGICA DE DONACIÓN
  // ============================================
  function inicializarEventosDonacion() {
    const botones = document.querySelectorAll('.donation-btn');
    
    botones.forEach(boton => {
      boton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Primero, validar el formulario de datos del donante
        const donante = validarFormulario();
        if (!donante) {
            return; // Si la validación falla, no hacer nada más
        }

        let monto;
        // Comprobar si es el botón de monto personalizado
        if (this.id === 'custom-amount-btn') {
            const customInput = document.getElementById('custom-amount-input');
            monto = parseInt(customInput.value, 10);
            if (isNaN(monto) || monto < 1000) {
                alert('Por favor, ingresa un monto válido (mínimo $1.000).');
                customInput.style.borderColor = 'red';
                customInput.focus();
                return;
            }
        } else {
            // Es un botón de monto predefinido
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
  // 6. INICIAR TODO CUANDO EL DOM ESTÉ LISTO
  // ============================================
  document.addEventListener('DOMContentLoaded', function() {
    inicializarTracking();
    inicializarEventosDonacion();
  });

})();
