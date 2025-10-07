// ============================================
// ISF CHILE - ALCANCÍAS DIGITALES
// Sistema de tracking de voluntarios
// ============================================

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
          color: white;
          padding: 15px 20px;
          border-radius: 10px;
          margin: 20px auto 0;
          max-width: 600px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          animation: slideIn 0.5s ease-out;
        `;
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
          heroContent.appendChild(mensajeDiv);
        }
      }
      mensajeDiv.innerHTML = `<p style="margin: 0; font-size: 1.1rem;">🤝 Estás apoyando la campaña de <strong>${nombreFormateado}</strong></p>`;
    }
  }

  // ============================================
  // 3. FUNCIÓN PRINCIPAL: IR A DONAR
  // ============================================
  function irADonar(monto) {
    const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
    const uuid = generarUUID();
    
    // IMPORTANTE: Ajustar según documentación real de Payku
    const paykuConfig = {
      baseUrl: 'https://app.payku.cl/payment',
      publicKey: 'tu_public_key_aqui' // ← ¡¡¡REEMPLAZAR CON TU PUBLIC KEY DE PAYKU!!!
    };
    
    const params = new URLSearchParams({
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
      uuid: uuid,
      timestamp: new Date().toISOString()
    });
    
    window.location.href = urlCompleta;
  }

  // ============================================
  // 4. GENERAR UUID (compatible con todos los navegadores)
  // ============================================
  function generarUUID() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ============================================
  // 5. INICIALIZAR BOTONES DE DONACIÓN
  // ============================================
  function inicializarBotones() {
    const botones = document.querySelectorAll('.donation-btn');
    botones.forEach(boton => {
      boton.addEventListener('click', function(e) {
        e.preventDefault();
        let monto = this.getAttribute('data-monto');
        if (monto) {
          irADonar(parseInt(monto));
        } else {
          console.error('❌ No se pudo determinar el monto para este botón');
        }
      });
    });
    console.log(`✅ ${botones.length} botones de donación inicializados`);
  }

  // ============================================
  // 6. INICIAR TODO CUANDO EL DOM ESTÉ LISTO
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      inicializarTracking();
      inicializarBotones();
    });
  } else {
    inicializarTracking();
    inicializarBotones();
  }
})();
