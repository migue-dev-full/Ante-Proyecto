


// Selectores
const form = document.querySelector("#form-login");
const loginEmail = document.querySelector("#email-login");
const loginPassword = document.querySelector("#password-login");
const loginButton = document.querySelector("#login-btn");
const notificacion = document.querySelector(".notification");

let isLoggedIn = false; // Variable para verificar si el usuario está logueado
// Validaciones

let valemail = false;
let valpassword = false;

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;


loginEmail.addEventListener("input", (e) => {
    valemail = emailRegex.test(e.target.value);
    if (valemail) {
        loginEmail.classList.add("border-green-700", "border-4");
        loginEmail.classList.remove("border-red-700", "border-4"); 
    } else {
        loginEmail.classList.remove("border-green-700", "border-4");
        loginEmail.classList.add("border-red-700", "border-4");
    }
});

loginPassword.addEventListener("input", (e) => {
    e.preventDefault();
    valpassword = passwordRegex.test(e.target.value);
    if (valpassword) {
        loginPassword.classList.add("border-green-700", "border-4");
        loginPassword.classList.remove("border-red-700", "border-4");
    } else {
        loginPassword.classList.remove("border-green-700", "border-4");
        loginPassword.classList.add("border-red-700", "border-4");
    }
});

//* Login
loginButton.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        const response = await axios.post('/user/login', {
            email: loginEmail.value,
            password: loginPassword.value
        });

        console.log('Login response:', response);

        if (response.data && response.data.success && response.data.user) {
            const user = response.data.user;
            // Guarda el usuario en localStorage con un tiempo de expiración de 1 hora
            const expirationTime = Date.now() + 15 * 60 * 1000;      
            localStorage.setItem('user', JSON.stringify({ ...user, expiration: expirationTime }));

            
            // Configura un temporizador para eliminar el usuario cuando expire
            setTimeout(() => {
                localStorage.removeItem('user');
                // Opcional: redirigir al login o recargar la página para forzar logout
                window.location.href = '/login';
            }, expirationTime - Date.now());


             notificacion.innerHTML =   ('Inicio de sesión exitoso. Bienvenido: ' + `${user.nombre}`)
             setTimeout (() =>  
                {
                   

                    ///aqui seria donde voy a guardar en la COOKIE
            // alert('Inicio de sesión exitoso. Bienvenido ' + user.nombre + '!');
            if (user.rol === 'Cliente') {
                // Redirigir a la página de cliente
                window.location.href = '/tienda';
            }else if (user.rol === 'Admin') {
                // Redirigir a la página de admin
                window.location.href = '/admin';
            }





                }, 2000);

            
            
            
            loginButton.classList.add('hidden')
           
        } else if (user.password !== loginPassword.value) {
            alert('Contraseña incorrecta. Por favor, inténtelo de nuevo.');
        }
    } catch (error) {
        console.log(error);
        alert('Error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.');
    }
});
