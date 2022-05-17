const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser');
const fs = require('fs')
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const exphbs = require("express-handlebars");
const expressFileUpload = require('express-fileupload');
app.use( expressFileUpload({
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "Peso del archivo es mayor a lo permitido",
    })
);
const { v4: uuidv4 } = require('uuid')

app.listen(port, () => console.log(`Up en ${port}`))

app.use(express.static("assets"));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.set('view engine', 'handlebars');
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
    'handlebars',
    exphbs.engine ({
        layoutsDir: __dirname + '/views',
        partialsDir: __dirname + '/views/componentes/',
    })
);

app.get('/', (req,res) => {
    res.render('index', {
        layout: 'index'
    });
});

app.get('/Registro', (req,res) => {
    res.render('registro', {
        layout: 'registro'   
    });
});

app.get('/Login', (req,res) => {
    res.render('login', {
        layout: 'login',
        registro: false
    });
});

app.get('/deberes', (req,res) => {
    res.render('deberes', {
        layout: 'deberes'
    });
});

app.get('/tareas', (req,res) => {
    res.render('tareas', {
        layout: 'tareas'
    });
});

app.get('/recreo', (req,res) => {
    res.render('recreo', {
        layout: 'recreo'
    });
});

const { nuevoUsuario,getUsuarios,editUsuario,validarUsuario,deleteUsuario,deleteImagenesUsuario } = require('./consultasUsuarios.js');
const { nuevoMensaje,getMensajes,editMensajes,validarMensajes,deleteMensajes } = require('./consultasMensajes.js');

const secretKey = 'KirbyMariano'

app.get('/token', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secretKey, (err, data) => {
        res.send( err ? 'Token invalido' : data );
    });
});

app.get('/SignIn', async (req, res) => {
    const { email, password } = req.query;
    const respuesta = await getUsuarios()
    const user = respuesta.find((u) => u.email == email && u.password == password);
    if (user) {
        const token = jwt.sign(
            {
                exp: Math.floor(Date.now() / 1000) + 120,
                data: user,
            },
            secretKey
        );
        if (user.administrador == true){
            res.send(`
            <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=http://localhost:3000/Admin?token=${token}">
            Admin ${email}.
            <script>
            sessionStorage.setItem('token', JSON.stringify('${token}'))
            </script>
            `);
        } else if (user.moderador == true) {
            res.send(`
            <META HTTP-EQUIV="REFRESH" CONTENT="1;URL=http://localhost:3000/Colaborador?token=${token}">
            Colaborador ${email}.
            <script>
            sessionStorage.setItem('token', JSON.stringify('${token}'))
            </script>
            `);    
        } else if (user.moderador == false && user.administrador == false) {
            res.send('Usuario no cuenta con permisos de Colaborador');    
        }
    } else {
        res.send('Usuario o contraseña incorrectas');
    }
});

app.get('/Admin', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
            res.render('admin', {
                layout: 'admin',
                token:token,
                email: decoded.data.email,
                nombre: decoded.data.nombre,
                password: decoded.data.password,                
            });
    });
});

app.get('/Colaborador', (req,res) => {
    let { token } = req.query;
    jwt.verify(token, secretKey, (err,decoded) => {
        err
            ? res.status(401).send({
                error: '401 No autorizado',
                message: err.message,
            })
            :
            res.render('colaborador', {
                layout: 'colaborador',
                token:token,
                email: decoded.data.email,                
            });
    });
});

// Inicio rutas para cada vista de Usuarios
app.post('/usuario', async (req, res) => {
    const email = req.body.email
    const nombre = req.body.nombre
    const pass1 = req.body.password1
    const pass2 = req.body.password2
    if (pass1 == pass2){
        const pass = pass1
        const { foto_usuario } = req.files;
        const img = `foto-${email}`;
        foto_usuario.mv(`${__dirname}/assets/img/perfiles/${img}.jpg`, (err) => {
            console.log('Imagen agregada correctamente')
        })
        const respuesta = await nuevoUsuario(email,nombre,pass,img)
        const respuesta2 = await getUsuarios();
        fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
        res.render('login', {
            layout: 'login',
            registro: true
        });
        console.log(respuesta[0])
        console.log("Registro de usuario exitoso")
    } else {
        console.log('Contraseñas no coinciden')
    }
});

app.get('/usuarios', async (req,res) => {
    const respuesta = await getUsuarios();
    res.send(respuesta);
    fs.writeFileSync('usuarios.json', JSON.stringify(respuesta))
})

app.post('/usuarioEdit', async (req,res) => {
    const email = req.body.correo
    const nombre = req.body.name
    const pass1 = req.body.pass1
    const pass2 = req.body.pass2
    const exp = req.body.exp
    const esp = req.body.esp
    if (pass1 == pass2){
        const pass = pass1
        const respuesta = await editUsuario(email,nombre,pass,exp,esp)
        console.log(respuesta)
        console.log('Usuario editado correctamente')
        const respuesta2 = await getUsuarios();
        fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
        res.render('login', {
            layout: 'login',
            registro: false
        });
    } else {
        console.log('Contraseñas no coinciden')
    }

})

app.put('/usuario', async (req, res) => {
    const { email, moderador } = req.body;
    const respuesta = await validarUsuario(email, moderador);
    const respuesta2 = await getUsuarios();
    console.log(respuesta2)
    console.log(respuesta[0])
    console.log('usuario validado')
    fs.writeFileSync('usuarios.json', JSON.stringify(respuesta2))
    res.send(console.log('Archivo actualizado'))
});


app.delete('/usuario/:email', async (req, res) => {
    const { email } = req.params;
    const respuestaDeleteImgs = await deleteImagenesUsuario(email)
    let multimedia = []
    multimedia = respuestaDeleteImgs
    multimedia.forEach((m, i) => {
        fs.unlink(`${__dirname}/assets/img/${m.seccion}/${m.multimedia}.jpg`, (err) => {
            i + 1;
        })
    })
    const respuestaDelete = await deleteUsuario(email)
    const respuestaRefreshUsers = await getUsuarios();
    fs.writeFileSync('usuarios.json', JSON.stringify(respuestaRefreshUsers))
    fs.unlink(`${__dirname}/assets/img/perfiles/foto-${email}.jpg`, (err) => {
        console.log(`Imagen de ${email} eliminada`);
    });
    const respuestaRefreshMsg = await getMensajes();
    fs.writeFileSync('mensajes.json', JSON.stringify(respuestaRefreshMsg))
    res.render('admin', {
        layout: 'admin',               
    });
});

// Fin rutas para cada vista de Usuario

// Inicio rutas para cada vista de Mensajes
app.post('/mensaje', async (req, res) => {
    const contenido = req.body.contenido
    const autor = req.body.autor
    const seccion = req.body.seccion
    const { multimedia } = req.files;
    const img = `${autor}-${seccion}-${uuidv4().slice(8)}`;
    multimedia.mv(`${__dirname}/assets/img/${seccion}/${img}.jpg`, (err) => {
        console.log('Imagen agregada correctamente')
    })
    const respuesta = await nuevoMensaje(contenido,seccion,img,autor)
    const respuesta2 = await getMensajes();
    fs.writeFileSync('mensajes.json', JSON.stringify(respuesta2))
    console.log(`Registro de mensaje exitoso en seccion ${seccion}`)
    res.render('colaborador', {
        layout: 'colaborador',
        email:respuesta[0].autor,                
    });         
});

app.get('/mensajes', async (req,res) => {
    const respuesta = await getMensajes();
    res.send(respuesta);
    fs.writeFileSync('mensajes.json', JSON.stringify(respuesta))
})

app.post('/mensajeEdit', async (req,res) => {
    const id = req.body.idEdit
    const contenido = req.body.contenidoEdit
    const respuesta = await editMensajes(id,contenido)
    console.log(respuesta)
    console.log('Mensaje editado correctamente')
    const respuesta2 = await getMensajes();
    fs.writeFileSync('mensajes.json', JSON.stringify(respuesta2))
    res.render('colaborador', {
        layout: 'colaborador',
        email:respuesta[0].autor,                
    });

})

app.put('/mensaje', async (req, res) => {
    const { id, visible } = req.body;
    const respuesta = await validarMensajes(id, visible);
    const respuesta2 = await getMensajes();
    console.log(respuesta2)
    console.log(respuesta[0])
    console.log('mensaje validado')
    fs.writeFileSync('mensajes.json', JSON.stringify(respuesta2))
    res.send(console.log('Archivo actualizado'))
});


app.delete('/mensaje/:id', async (req, res) => {
    const { id } = req.params;
    const respuestaImg = await getMensajes();
    const mensaje = respuestaImg.find((m) => m.id == id);
    if (mensaje){
        fs.unlink(`${__dirname}/assets/img/${mensaje.seccion}/${mensaje.multimedia}.jpg`, (err) => {
            console.log(`Imagen de mensaje ID ${mensaje.multimedia} eliminada`);
        });
    }
    const respuestaDelete = await deleteMensajes(id)
    console.log(respuestaDelete)
    const respuestaRefresh = await getMensajes();
    fs.writeFileSync('mensajes.json', JSON.stringify(respuestaRefresh))
    console.log(`Mensaje ${id} eliminado del JSON`)
    res.render('colaborador', {
        layout: 'colaborador',
        email:mensaje.email,                
    });   
});

// Fin rutas para cada vista de Mensajes