// Script básico
console.log('✅ main.js cargado correctamente');

document.addEventListener('DOMContentLoaded', () => {
  // Obtener elementos del DOM
  const button = document.getElementById('actionButton');
  const counterElement = document.getElementById('counter');

  // Inicializar el contador
  let counter = 0;

  // Agregar un evento al botón
  button.addEventListener('click', () => {
    // Incrementar el contador
    counter++;
    // Actualizar el texto del contador en la página
    counterElement.textContent = counter;
  });
});