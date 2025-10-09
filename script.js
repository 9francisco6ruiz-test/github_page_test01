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
// 4. FUNCIÓN PRINCIPAL: IR A DONAR (VERSIÓN FINAL CON FETCH API)
// ============================================
function irADonar(monto, donante) {
  const voluntario = localStorage.getItem('isf_voluntario') || 'directo';
  const orderId = self.crypto.randomUUID ? self.crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
  
  const paykuConfig = {
    baseUrl: 'https://des.payku.cl/api/transaction',
    publicKey: 'tkpucea57c4ac26436994d30a85a0ee8' 
  };

  // 1. Creamos un objeto JavaScript con todos los datos que la API espera.
  const datosTransaccion = {
    email: donante.email,
    order: orderId,
    subject: 'Donación ISF Chile',
    amount: monto,
    currency: 'CLP', // Añadimos la moneda, que es requerida.
    // Los campos personalizados se envían como un objeto anidado.
    additional_parameters: {
      voluntario: voluntario,
      campana: 'alcancia_digital_2025'
    },
    urlreturn: `${window.location.origin}/gracias.html?order_id=${orderId}`,
    urlnotify: 'URL_DE_TU_WEBHOOK_DE_GOOGLE_APPS_SCRIPT' // ¡IMPORTANTE! Poner la URL real aquí.
  };

  console.log('🚀 Preparando para enviar los siguientes datos a Payku:', datosTransaccion);

  // 2. Usamos la API 'fetch' para enviar los datos como JSON.
  fetch(paykuConfig.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // La forma más común de enviar un token público en una API es a través de un encabezado 'Authorization'.
      // El formato 'Bearer [token]' es un estándar.
      'Authorization': 'Bearer ' + paykuConfig.publicKey
    },
    // Convertimos nuestro objeto de JavaScript a una cadena de texto en formato JSON.
    body: JSON.stringify(datosTransaccion)
  })
  .then(response => {
    // Verificamos si la respuesta del servidor fue exitosa.
    if (!response.ok) {
      // Si no fue exitosa, leemos el error y lo mostramos.
      return response.json().then(errorData => {
        throw new Error(`Error del servidor: ${response.status} - ${JSON.stringify(errorData)}`);
      });
    }
    // Si fue exitosa, convertimos la respuesta a JSON.
    return response.json();
  })
  .then(data => {
    // 3. El servidor de Payku nos responde con los datos de la transacción creada.
    // Buscamos la URL a la que debemos redirigir al usuario.
    console.log('✅ Respuesta exitosa de Payku:', data);
    
    // Suponemos que la URL de redirección viene en un campo llamado 'url' o 'payment_url'.
    // ¡DEBEMOS VERIFICAR EL NOMBRE DE ESTE CAMPO EN LA RESPUESTA REAL!
    const urlRedireccion = data.url || data.payment_url; 

    if (urlRedireccion) {
      // Si encontramos la URL, redirigimos al usuario para que pague.
      window.location.href = urlRedireccion;
    } else {
      alert('Se creó la transacción, pero no se encontró una URL de pago. Revisa la consola.');
      console.error('La respuesta de Payku no contenía una URL de redirección.', data);
    }
  })
  .catch(error => {
    // Si algo falla en el proceso, lo mostramos en la consola y al usuario.
    console.error('❌ Error al crear la transacción en Payku:', error);
    alert('Hubo un error al intentar iniciar el proceso de pago. Por favor, revisa la consola para más detalles.');
  });
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
