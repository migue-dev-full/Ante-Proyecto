

const formC = document.querySelector("#form-register");
const registerEmail = document.querySelector("#emailCreate");
const registerPassword = document.querySelector("#passwordCreate");
const registerButton = document.querySelector("#register-btn");
const registerName = document.querySelector("#nameCreate");


let valemail = false;
let valpassword = false;

const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

registerEmail.addEventListener("input", (e) => {
    valemail = emailRegex.test(e.target.value);
    if (valemail == true) {
        registerEmail.classList.add("border-green-700", "border-4");
        registerEmail.classList.remove("border-red-700", "border-4"); 
    }else {
        registerEmail.classList.remove("border-green-700", "border-4",);
        registerEmail.classList.add("border-red-700", "border-4");
    }
});

registerPassword.addEventListener("input", (e) => {
    e.preventDefault();
    valpassword = passwordRegex.test(e.target.value);
    //console.log(valpassword);
    if (valpassword == true) {
        registerPassword.classList.add("border-green-700", "border-4");
        registerPassword.classList.remove("border-red-700", "border-4");
    }else {
        registerPassword.classList.remove("border-green-700", "border-4");
        registerPassword.classList.add("border-red-700", "border-4");
    }
});

registerButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (valemail === true && valpassword === true) {
        const user = {
            name: registerName.value,
            email: registerEmail.value,
            password: registerPassword.value
        };
        
        const notification = document.querySelector(".notification");
        
                
        const notificacion = document.querySelector('.notification');
        notificacion.textContent = 'El usuario se ha registrado correctamente';
        notificacion.style.color = 'white';
        notificacion.style.display = 'block';
        notificacion.style.zIndex = '1000';
        
        setTimeout(() => {
            notificacion.style.display = 'none';
            window.location.href = '/login';
        }, 3000);
     
    } else {
        // Mostrar mensaje de error o alerta
        
        
        console.log("Por favor, completa todos los campos correctamente.");
    }
});


registerButton.addEventListener('click', async e => { //async va ahi
    e.preventDefault()
    
    

    const users1 = await axios.get('/user/lista-users')
    const users = users1.data.data
    //console.log(users.data.data)
    const user = users.find(u => u.nombre === registerName.value && u.email === registerEmail.value && u.password === registerPassword.value);
    if (!registerName.value && !registerEmail.value && !registerPassword.value) { //para evitar === vacio === x
        //si esta vacio =>

        //   console.log("El campo esta vacio")
        notificacion.innerHTML = `Los campos  no deben estar vacio`
        notificacion.classList.add('show-notification')
        setTimeout(() => {
            notificacion.classList.remove('show-notification')

        }, 2000)
        //otro caso para que no vuelva a crear el mismo usuario
    } else if (user === users) {
        
        console.log("El usuario ya existe")
        notificacion.innerHTML = `El usuario ${registerName.value} ya existe`
        notificacion.classList.add('show-notification')
        setTimeout(() => {
            notificacion.classList.remove('show-notification')

        }, 2000)

    } else {
        //caso esta lleno, y no existe en json.db registramos
        console.log("El campo esta lleno")
        //cuando colocar un asycn await, este proceso necesito que varios usuarios se conectan al mismo tiempo? Si es si usamos el asycn await
        /*  await fetch(url,{
              method:'POST', //metodo post
              headers:{
                  'Content-Type':'application/json' //plantilla siempre que usemos post
              
              },
              body:JSON.stringify({nombre:createInput.value}) //porque queremos agregar lo que tiene create input
          })*/

        const nombre = registerName.value
        const email = registerEmail.value
        const password = registerPassword.value

        //notificacion 
        //enviar informacion al backend

        try {
            const response = await axios.post('/user', { 
                nombre: nombre, 
                email: email, 
                password: password 
            });
            console.log('Backend response:', response.data);
            notificacion.innerHTML = `Usuario ${nombre} creado exitosamente`;
            notificacion.classList.add('show-notification');
            setTimeout(() =>
                {
                    notificacion.classList.remove('show-notification');
                    }, 2000);
            
            await new user(nombre, email, password).save(); // Guardar el nuevo usuario en la base de datos
        } catch (error) {
            console.error('Registration error:', error.response?.data || error.message);
           
            setTimeout(() => {
                notificacion.classList.remove('show-notification');
            }, 2000);
        }
    }
})