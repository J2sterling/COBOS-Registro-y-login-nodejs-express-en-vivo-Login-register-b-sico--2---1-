document.addEventListener("DOMContentLoaded", function () {
    // Redirecciones de los botones en la barra de navegación
    document.getElementById("btn-add-participant").addEventListener("click", function () {
        window.location.href = "/admin/agregar-ni";
    });

    document.getElementById("btn-more-info").addEventListener("click", function () {
        window.location.href = "/admin/MasInformacion.html";
    });

    document.getElementById("btn-activity-schedule").addEventListener("click", function () {
        window.location.href = "/admin/AgendaActividades.html";
    });

    document.getElementById("btn-cancel").addEventListener("click", function () {
        window.location.href = "/admin/admin.html";
    });

    // Mostrar la sección del formulario cuando se presiona "Añadir niño"
    document.getElementById("show-form-btn").addEventListener("click", () => {
        document.getElementById("formulario-caso").style.display = "block";
    });

    // Cargar la lista de educadores al cargar la página
    async function cargarEducadores() {
        try {
            const response = await fetch("http://localhost:4000/api/educadores");
            const educadores = await response.json();

            const select = document.getElementById("educador-select");
            select.innerHTML = ""; // Limpia las opciones anteriores
            educadores.forEach(educador => {
                const option = document.createElement("option");
                option.value = educador.educador_id;
                option.textContent = educador.nombre;
                select.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar los educadores:", error);
        }
    }

    // Cargar los casos guardados y mostrarlos
    async function cargarCasosGuardados() {
        try {
            const response = await fetch("http://localhost:4000/api/casos");
            const casos = await response.json();

            const casosContainer = document.getElementById("casos-guardados");
            casosContainer.innerHTML = ""; // Limpia la sección antes de mostrar nuevos datos

            casos.forEach(caso => {
                const casoElement = document.createElement("p");
                casoElement.textContent = `Caso de ${caso.nombre_nino} (${caso.edad} años) - Acudiente: ${caso.nombre_acudiente}, Educador: ${caso.educador_nombre}`;
                casosContainer.appendChild(casoElement);
            });
        } catch (error) {
            console.error("Error al cargar los casos guardados:", error);
        }
    }

    cargarEducadores(); // Llama a la función para cargar los educadores
    cargarCasosGuardados(); // Llama a la función para cargar los casos guardados al cargar la página

    // Enviar el formulario al servidor con `educador_id`
    document.getElementById("agregar-caso-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const formData = new FormData(event.target);

        try {
            const response = await fetch("http://localhost:4000/api/agregar-caso", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                cargarCasosGuardados(); // Cargar y mostrar los casos guardados después de enviar el formulario
            } else {
                alert(data.message || "Error al guardar el caso.");
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            alert("Error al intentar guardar el caso.");
        }
    });
});
// Cargar actividades en la página de caso
async function cargarActividadCaso() {
    // Lógica específica para la página de caso
    document.querySelector(".submit-feedback").addEventListener("click", async () => {
        const casoId = "caso_1";  // Usa el ID correcto de tu caso aquí o pásalo dinámicamente
        const descripcion = document.getElementById("activity-description").value;
        const estado = document.querySelector(".activities select").value;
        const recursos = document.getElementById("resources").value;
        const habilidades = {
            interpersonal: document.querySelector(".skill.interpersonal").classList.contains("selected"),
            linguistica: document.querySelector(".skill.linguistica").classList.contains("selected"),
        };

        const formData = new FormData();
        formData.append("caso_id", casoId);
        formData.append("actividad_estado", estado);
        formData.append("actividad_descripcion", descripcion);
        formData.append("recursos_necesarios", recursos);
        formData.append("habilidad_interpersonal", habilidades.interpersonal ? 1 : 0);
        formData.append("habilidad_linguistica", habilidades.linguistica ? 1 : 0);

        try {
            const response = await fetch("http://localhost:4000/api/agregar-caso2", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message || "Caso guardado exitosamente.");
            } else {
                alert(data.message || "Error al guardar el caso.");
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            alert("Error al intentar guardar el caso.");
        }
    });
}

// Ejecuta la función si estamos en la página de casos
if (document.querySelector(".main-content h1").textContent === "Caso 1") {
    cargarActividadCaso();
};document.addEventListener("DOMContentLoaded", function () { 
    // Mostrar habilidades adicionales al hacer clic en "+"
    const addSkillBtn = document.getElementById("add-skill-btn");
    const additionalSkillsContainer = document.getElementById("additional-skills");
    const selectedSkillsContainer = document.getElementById("selected-skills");

    if (addSkillBtn) {
        addSkillBtn.addEventListener("click", function () {
            additionalSkillsContainer.classList.toggle("hidden"); // Alterna la visibilidad de las habilidades adicionales
        });
    }

    // Agregar habilidad seleccionada al hacer clic en una de las habilidades adicionales
    if (additionalSkillsContainer) {
        additionalSkillsContainer.addEventListener("click", function (event) {
            if (event.target.classList.contains("skill")) {
                const skillName = event.target.getAttribute("data-skill");

                // Crear elemento de habilidad seleccionada con botón de eliminar
                const skillElement = document.createElement("span");
                skillElement.className = `skill ${event.target.classList[1]}`; // Usa la clase de color existente
                skillElement.innerHTML = `${skillName} <button class="remove-skill-btn">x</button>`;

                // Agregar habilidad a la lista de habilidades seleccionadas
                selectedSkillsContainer.appendChild(skillElement);

                // Ocultar el contenedor de habilidades adicionales
                additionalSkillsContainer.classList.add("hidden");
            }
        });
    }

    // Eliminar habilidad seleccionada al hacer clic en "x"
    selectedSkillsContainer.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-skill-btn")) {
            const skillToRemove = event.target.parentElement;
            skillToRemove.remove();
        }
    });

    // Funcionalidad para subir archivos
    const uploadInput = document.getElementById("upload-input");
    const uploadButton = document.getElementById("upload-button");
    const uploadedFilesList = document.getElementById("uploaded-files-list");

    uploadButton.addEventListener("click", function () {
        uploadInput.click(); // Simula un clic en el input de tipo file
    });

    uploadInput.addEventListener("change", function () {
        const fileList = uploadInput.files;
        
        // Limpia la lista de archivos subidos antes de mostrar los nuevos
        uploadedFilesList.innerHTML = '';

        for (let i = 0; i < fileList.length; i++) {
            const listItem = document.createElement("li");
            listItem.textContent = fileList[i].name;
            uploadedFilesList.appendChild(listItem);
        }
    });
});
