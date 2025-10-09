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
    }
    
    const voluntarioActual = localStorage.getItem('isf_voluntario');
    if (voluntarioActual && !voluntarioParam) {
      personalizarMensaje(voluntarioActual);
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
  // 4. FUNCIÓN PRINCIPAL: IR A DONAR (VERSIÓN DEFINITIVA)
  // ============================================
  function irADonar(monto, donante) {
    const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
    const orderId = self.crypto.randomUUID ? self.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
    
    const paykuConfig = {
      baseUrl: 'https://des.payku.cl/api/transaction', // URL correcta de la API para crear la transacción
      publicKey: 'tkpucea57c4ac26436994d30a85a0ee8' 
    };
    
    // Para la redirección web, los parámetros se envían en un formulario que se auto-envía.
    // Creamos un formulario invisible en la página, lo llenamos con los datos y lo enviamos.
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paykuConfig.baseUrl;

    const fields = {
      email: donante.email,
      order: orderId,
      subject: 'Donación ISF Chile',
      amount: monto,
      // La documentación indica que el token público se envía como 'public_token' en el formulario
      token: paykuConfig.publicKey, 
      // Los campos personalizados se envían como 'additional_parameters'
      'additional_parameters[voluntario]': voluntario,
      'additional_parameters[campana]': 'alcancia_digital_2025',
      // Payku necesita saber a dónde redirigir al usuario después del pago
      urlreturn: `${window.location.origin}/gracias.html?order_id=${orderId}`,
      urlnotify: 'https://script.google.com/macros/s/AKfycbwXf1iJJeWy-0DbygQiPQkX5HBba6hBf-HVJ8-mTpPXBMiC5AMFjqjdZuec8AJ_OoRmNw/exec' // Esta URL debe ser la real de tu Apps Script
    };

    for (const key in fields) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = fields[key];
      form.appendChild(hiddenField);
    }

    document.body.appendChild(form);
    
    console.log('🚀 Enviando formulario a Payku con los siguientes datos:', fields);
    
    form.submit();
  }

  // ============================================
  // 5. INICIALIZAR BOTONES Y LÓGICA DE DONACIÓN
  // ============================================
  function inicializarEventosDonacion() {
    const botones = document.querySelectorAll('.donation-btn');
    
    botones.forEach(boton => {
      boton.addEventListener('click', function(e) {
        e.preventDefault();
        
        const donante = validarFormulario();
        if (!donante) {
            return;
        }

        let monto;
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
