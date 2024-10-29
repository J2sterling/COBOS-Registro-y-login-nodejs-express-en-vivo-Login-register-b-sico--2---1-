document.addEventListener("DOMContentLoaded", function () {
    // Inicialmente oculta las secciones de "Nombre del caso" y "Información personal"
    document.querySelector(".form-section").style.display = "none";

    // Lógica para el botón "Añadir niño"
    document.querySelector(".add-student-btn").addEventListener("click", function () {
        document.querySelector(".form-section").style.display = "block";
    });

    // Lógica para el botón "Agregar"
    document.querySelector(".add-btn").addEventListener("click", async function () {
        const nombreNino = document.getElementById("nombre-nino").value;
        const edad = document.getElementById("edad").value;
        const nombreAcudiente = document.getElementById("nombre-acudiente").value;
        const correoAcudiente = document.getElementById("correo-acudiente").value;

        if (nombreNino && edad && nombreAcudiente && correoAcudiente) {
            try {
                // Enviar datos al servidor si se requiere
                const response = await fetch('/api/agregar-ni', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombreNino,
                        edad,
                        nombreAcudiente,
                        correoAcudiente
                    })
                });
                const data = await response.json();
                if (response.ok) {
                    alert("Información guardada correctamente");
                } else {
                    alert(data.message || "Hubo un error al guardar la información");
                }
            } catch (error) {
                console.error("Error al guardar los datos:", error);
                alert("Error de conexión al servidor.");
            }
        } else {
            alert("Por favor, completa todos los campos obligatorios.");
        }
    });

    // Lógica para los botones de subir foto
    document.querySelectorAll(".upload-btn").forEach(button => {
        button.addEventListener("click", function () {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = () => {
                if (fileInput.files.length > 0) {
                    const fileName = fileInput.files[0].name;
                    alert("Archivo seleccionado: " + fileName);
                }
            };
            fileInput.click();
        });
    });
});
