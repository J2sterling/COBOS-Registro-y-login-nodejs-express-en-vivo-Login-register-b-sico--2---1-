document.addEventListener("DOMContentLoaded", () => {
    // Manejo de errores en el formulario de login
    const mensajeError = document.getElementsByClassName("error")[0];
    
    // Lógica de inicio de sesión
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const user = e.target.elements.user.value;
        const password = e.target.elements.password.value;
        try {
          const res = await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, password })
          });
  
          if (!res.ok) {
            mensajeError.classList.toggle("escondido", false);
            return;
          }
  
          const resJson = await res.json();
          if (resJson.redirect) {
            window.location.href = resJson.redirect;
          }
        } catch (error) {
          console.error("Error en la solicitud de inicio de sesión:", error);
        }
      });
    }
  
    // Lógica de registro
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
  
        const user = document.getElementById("user").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
  
        try {
          const response = await fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ user, email, password })
          });
  
          const data = await response.json();
  
          if (response.ok) {
            alert(data.message);
            window.location.href = "/login";
          } else {
            alert(data.message || "Error en el registro.");
          }
        } catch (error) {
          console.error("Error en la solicitud de registro:", error);
          alert("Error al intentar registrar el usuario.");
        }
      });
    }
  
    // Lógica para cerrar sesión
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
  
          if (res.ok) {
            window.location.href = "/login";
          } else {
            alert("Error al cerrar sesión. Intente nuevamente.");
            console.error("Error al cerrar sesión:", res.statusText);
          }
        } catch (error) {
          console.error("Error al realizar la solicitud de cierre de sesión:", error);
        }
      });
    } else {
      console.error("No se encontró el botón para cerrar sesión.");
    }
  
    // Función de ejemplo para iniciar sesión (opcional)
    function iniciarSesion(username, password) {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log("Inicio de sesión exitoso");
          window.location.href = "/admin";
        } else {
          alert("Credenciales incorrectas. Intente nuevamente.");
        }
      })
      .catch(error => console.error("Error al iniciar sesión:", error));
    }
  
    // Lógica para agregar nuevo caso
    document.querySelector(".add-btn")?.addEventListener("click", async function () {
      const nombreNino = document.getElementById("nombre-nino").value;
      const edad = document.getElementById("edad").value;
      const nombreAcudiente = document.getElementById("nombre-acudiente").value;
      const correoAcudiente = document.getElementById("correo-acudiente").value;
  
      if (nombreNino && edad && nombreAcudiente && correoAcudiente) {
        try {
          const response = await fetch("/api/agregar-nino", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombreNino, edad, nombreAcudiente, correoAcudiente })
          });
  
          const data = await response.json();
          if (response.ok) {
            alert(data.message);
          } else {
            alert(data.message || "Error al guardar el caso.");
          }
        } catch (error) {
          console.error("Error al enviar los datos:", error);
          alert("Error al intentar guardar el caso.");
        }
      } else {
        alert("Por favor, completa todos los campos obligatorios.");
      }
    });
  });
  

