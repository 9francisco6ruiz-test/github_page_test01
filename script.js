document.addEventListener('DOMContentLoaded', function() {

    // --- Manejo del scroll suave para el botón CTA ---
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // --- Lógica del formulario de donación ---
    const donationForm = document.getElementById('donation-form');
    const amountOtherRadio = document.getElementById('amountOther');
    const otherAmountInput = document.getElementById('otherAmount');

    if (donationForm && amountOtherRadio && otherAmountInput) {
        // Mostrar u ocultar el campo "Otro monto"
        donationForm.addEventListener('change', function(event) {
            if (event.target.name === 'amount') {
                if (amountOtherRadio.checked) {
                    otherAmountInput.classList.remove('hidden');
                    otherAmountInput.required = true;
                } else {
                    otherAmountInput.classList.add('hidden');
                    otherAmountInput.required = false;
                    otherAmountInput.value = '';
                }
            }
        });

        // Manejar el envío del formulario
        donationForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Previene el envío real del formulario

            // Simulación de envío: muestra un mensaje de agradecimiento
            // En una aplicación real, aquí se conectaría con una pasarela de pago
            alert('¡Gracias por tu donación! Tu apoyo es fundamental para continuar nuestra labor.');

            // Opcional: Redirigir a la página principal de ISF Chile después de la donación
            // window.location.href = 'https://isf-chile.org/';

            // Limpiar el formulario después del envío
            donationForm.reset();
            otherAmountInput.classList.add('hidden');
            otherAmountInput.required = false;
        });
    }

});
