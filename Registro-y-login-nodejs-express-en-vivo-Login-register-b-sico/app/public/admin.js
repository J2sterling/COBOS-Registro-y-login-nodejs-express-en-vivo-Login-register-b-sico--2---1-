/*document.getElementsByTagName("button")[0].addEventListener("click",()=>{
  document.cookie ='jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  document.location.href = "/"
})


async function crearCaso() {
  const caso = {
      nombre: "Nuevo Caso",
      detalles: "Detalles del nuevo caso",
      educadorId: "ID_DE_EDUCADOR",
  };
  const response = await fetch("http://localhost:4000/api/casos", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(caso),
  });
  const data = await response.json();
  console.log(data);
}

// Evento para el botón "Nuevo caso"
document.querySelector('.new-case').addEventListener('click', crearCaso);
*/




// desarrollo frontend 

// Abrir un modal específico , ventana emergente


// admin.js

// Eliminar caso
// admin.js

// Función para agregar funcionalidad a los botones de modificar y eliminar
function addCaseActions(caseElement) {
  caseElement.querySelector('.modify').addEventListener('click', (event) => {
      const caseDetails = event.target.closest('.case').querySelector('p');
      const newDetails = prompt("Ingrese los nuevos detalles del caso:", caseDetails.textContent);
      if (newDetails) {
          caseDetails.textContent = newDetails;
          alert('Los detalles del caso han sido actualizados.');
      }
  });
  
  caseElement.querySelector('.delete').addEventListener('click', (event) => {
      const caseElement = event.target.closest('.case');
      caseElement.remove();
      alert('El caso ha sido eliminado.');
  });
}

// Asignar eventos a los casos iniciales
document.querySelectorAll('.case').forEach(caseElement => {
  addCaseActions(caseElement);
});

// Redirigir a la página de añadir educador al hacer clic en "Agregar educador"
const addEducatorButton = document.querySelector('.add-educator a');
if (addEducatorButton) {
  addEducatorButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/admin/anadir-educador';
  });
} else {
  console.error("No se encontró el botón para agregar educador.");
}

// Nuevo reporte
const newReportButton = document.querySelector('.new-report');
if (newReportButton) {
  newReportButton.addEventListener('click', () => {
      const reportDetails = prompt("Ingrese los detalles del nuevo reporte:");
      if (reportDetails) {
          const newReport = document.createElement('div');
          newReport.classList.add('case');
          newReport.innerHTML = `
              <img src="niño1.png" alt="Imagen del nuevo reporte">
              <p>${reportDetails}</p>
              <div class="actions">
                  <button class="modify">Modificar</button>
                  <button class="delete">Eliminar</button>
              </div>
          `;
          document.querySelector('.case-grid').appendChild(newReport);
          addCaseActions(newReport);
          alert('El nuevo reporte ha sido creado.');
      }
  });
} else {
  console.error("No se encontró el botón para crear un nuevo reporte.");
}

// Nuevo caso
const newCaseButton = document.querySelector('.new-case');
if (newCaseButton) {
  newCaseButton.addEventListener('click', () => {
      const caseDetails = prompt("Ingrese los detalles del nuevo caso:");
      if (caseDetails) {
          const newCase = document.createElement('div');
          newCase.classList.add('case');
          newCase.innerHTML = `
              <img src="niño1.png" alt="Imagen del nuevo caso">
              <p>${caseDetails}</p>
              <div class="actions">
                  <button class="modify">Modificar</button>
                  <button class="delete">Eliminar</button>
              </div>
          `;
          document.querySelector('.case-grid').appendChild(newCase);
          addCaseActions(newCase);
          alert('El nuevo caso ha sido creado.');
      }
  });
} else {
  console.error("No se encontró el botón para crear un nuevo caso.");
}

// Lógica para el cierre de sesión
const mensajeError = document.getElementsByClassName("error")[0];
const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      const res = await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        mensajeError.classList.toggle("escondido", false);
        mensajeError.textContent = "Error al cerrar sesión. Intente nuevamente.";
        console.error("Error al cerrar sesión:", res.statusText);
        return;
      }

      const resJson = await res.json();
      if (resJson.redirect) {
        // Redirige al usuario a la página de inicio de sesión
        window.location.href = resJson.redirect;
      }
    } catch (error) {
      console.error("Error al realizar la solicitud de cierre de sesión:", error);
      mensajeError.classList.toggle("escondido", false);
      mensajeError.textContent = "Error al realizar la solicitud. Intente nuevamente.";
    }
  });
} else {
  console.error("No se encontró el botón para cerrar sesión.");
}

